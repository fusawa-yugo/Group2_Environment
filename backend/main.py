from CNN import CNN
import torch
import numpy as np
from fastapi import FastAPI, Request
import time
import ntplib
from datetime import datetime


app = FastAPI()

@app.post("/")
async def test(request: Request):
    print("hello!")
    