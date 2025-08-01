# retrain_feedback_model.py
from models.feedback_trainer import FeedbackTrainer
from database.mongo import get_feedback_data

feedback = get_feedback_data()
trainer = FeedbackTrainer()
X, y = trainer.preprocess_data(feedback)
trainer.train(X, y)
trainer.save_model()
