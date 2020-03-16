import tensorflow as tf

# Flask
from flask import Flask, request, render_template, jsonify
from gevent.pywsgi import WSGIServer

# TensorFlow and tf.keras
import tensorflow as tf
from tensorflow import keras

from tensorflow.keras.applications.imagenet_utils import preprocess_input
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Some utilites
from sklearn.metrics.pairwise import pairwise_distances
import numpy as np
import pandas as pd


MODEL_PATH = 'models/resnet50_embed.h5'
# Load your own trained model
model = load_model(MODEL_PATH)

converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()