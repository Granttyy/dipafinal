# models/feedback_trainer.py

import os
import joblib
import numpy as np
import lightgbm as lgb
from typing import Tuple, List
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from database.mongo import get_feedback_data  # <- modularized

class FeedbackTrainer:
    def __init__(self, threshold: int = 3):
        self.threshold = threshold
        self.model = lgb.LGBMClassifier()

    def preprocess_data(self, feedback_data) -> Tuple[np.ndarray, np.ndarray]:
        X, y = [], []
        for fb in feedback_data:
            uv, pv, score = fb.get("user_vector"), fb.get("program_vector"), fb.get("score")
            if uv and pv and score is not None:
                try:
                    X.append(np.array(uv + pv))
                    y.append(1 if score >= self.threshold else 0)
                except Exception as e:
                    print("⚠️ Error processing feedback:", e)
        return np.array(X), np.array(y)

    def train(self, X, y):
        if len(X) == 0:
            raise ValueError("No data to train on.")

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)

        print(f"✅ Accuracy: {accuracy_score(y_test, y_pred):.2f}")
        print(classification_report(y_test, y_pred))

    def save_model(self, path="models/feedback_model.pkl"):
        joblib.dump(self.model, path)
        print(f"💾 Saved model to {path}")
