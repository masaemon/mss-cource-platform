from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from app.db.session import get_db
from app.schemas.comment import CommentCreate, CommentResponse, CommentUserInfo
from app.repositories.comment import CommentRepository
from app.repositories.course import CourseRepository
from app.api.dependencies import get_current_user, get_current_instructor
from app.core.rate_limit import check_comment_rate_limit, check_instructor_reply_rate_limit
from app.models.profile import Profile, UserRole
from app.models.comment import CourseComment

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.get("/courses/{course_id}/comments", response_model=List[CommentResponse])
async def get_course_comments(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    """コースのコメント一覧を取得"""
    # コースの存在確認
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    comment_repo = CommentRepository(db)
    comments = await comment_repo.get_course_comments(course_id)

    result = []
    for comment in comments:
        comment_dict = {
            "id": comment.id,
            "course_id": comment.course_id,
            "user_id": comment.user_id,
            "content": comment.content,
            "is_instructor_reply": comment.is_instructor_reply,
            "created_at": comment.created_at,
            "updated_at": comment.updated_at,
            "user": CommentUserInfo.model_validate(comment.user) if comment.user else None
        }
        result.append(CommentResponse(**comment_dict))

    return result


@router.post("/courses/{course_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    request: Request,
    course_id: str,
    comment_data: CommentCreate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(check_comment_rate_limit)
):
    """コースにコメントを投稿"""
    # コースの存在確認
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    comment_repo = CommentRepository(db)
    new_comment = CourseComment(
        id=str(uuid.uuid4()),
        course_id=course_id,
        user_id=current_user.id,
        content=comment_data.content,
        is_instructor_reply=False
    )

    created_comment = await comment_repo.create_comment(new_comment)

    # ユーザー情報を含めて返却
    return CommentResponse(
        **created_comment.__dict__,
        user=CommentUserInfo.model_validate(current_user)
    )


@router.post("/courses/{course_id}/comments/reply", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_instructor_reply(
    request: Request,
    course_id: str,
    comment_data: CommentCreate,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(check_instructor_reply_rate_limit)
):
    """講師としてコメントに返信"""
    # コースの存在確認
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # コースの講師または管理者のみ返信可能
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only course instructor can reply"
        )

    comment_repo = CommentRepository(db)
    new_comment = CourseComment(
        id=str(uuid.uuid4()),
        course_id=course_id,
        user_id=current_user.id,
        content=comment_data.content,
        is_instructor_reply=True  # 講師返信フラグ
    )

    created_comment = await comment_repo.create_comment(new_comment)

    return CommentResponse(
        **created_comment.__dict__,
        user=CommentUserInfo.model_validate(current_user)
    )


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """コメントを削除"""
    comment_repo = CommentRepository(db)
    comment = await comment_repo.get_comment_by_id(comment_id)

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # 自分のコメントまたは管理者のみ削除可能
    if comment.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )

    await comment_repo.delete_comment(comment)
    return None
