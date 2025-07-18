# test.py
try:
    from fastapi import FastAPI
    print("FastAPI is imported successfully.")
except ImportError as e:
    print(f"Error: {e}")