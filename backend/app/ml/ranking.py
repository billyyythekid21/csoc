import numpy as np
from sqlalchemy.orm import Session
from sklearn.linear_model import LogisticRegression

from app.models.match import MatchRecord
from app.models.user import User


def cosine_similarity(a: list[float], b: list[float]) -> float:
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def get_trained_model(db: Session, current_user: User):
    """
    Train a logistic regression on the current user's like/pass history.
    Returns None if there isn't enough data yet (need at least 5 of each).
    """
    actions = (
        db.query(MatchRecord)
        .filter(MatchRecord.from_user_id == str(current_user.id))
        .all()
    )

    likes = [a for a in actions if a.action == "like"]
    passes = [a for a in actions if a.action == "pass"]

    # not enough data for training
    if len(likes) < 5 or len(passes) < 5:
        return None

    X = []
    y = []

    for action in actions:
        other_user = (
            db.query(User).filter(User.id == action.to_user_id).first()
        )

        if (
            other_user is None
            or other_user.embedding is None
            or current_user.embedding is None
        ):
            continue

        similarity = cosine_similarity(
            list(other_user.embedding), list(current_user.embedding)
        )
        X.append([similarity])
        y.append(1 if action.action == "like" else 0)

    if len(X) < 10:
        return None

    model = LogisticRegression()
    model.fit(X, y)
    return model


def rank_candidates(
    current_user: User, candidates: list[User], model
) -> list[tuple[User, float]]:
    """
    Score each candidate using the trained model if available,
    otherwise fall back to raw embedding similarity.
    """
    scored = []
    for candidate in candidates:
        if candidate.embedding is None or current_user.embedding is None:
            continue

        similarity = cosine_similarity(
            list(candidate.embedding), list(current_user.embedding)
        )

        if model is not None:
            # probability of like given past behaviour
            score = model.predict_proba([[similarity]])[0][1]
        else:
            # use raw similarity as a fallback if not enough data yet
            score = similarity

        scored.append((candidate, round(score, 4)))

    scored.sort(key=lambda x: x[1], reverse=True)
    return scored
