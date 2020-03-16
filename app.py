import os
import sys
# Flask
from flask import Flask, redirect, url_for, request, render_template, Response, jsonify
from werkzeug.utils import secure_filename
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
from util import base64_to_pil
import pickle

# Declare a flask app
app = Flask(__name__)

# You can use pretrained model from Keras
# Check https://keras.io/applications/
#from keras.applications.mobilenet_v2 import MobileNetV2
#model = MobileNetV2(weights='imagenet')

#print('Model loaded. Check http://127.0.0.1:5000/')

# Model saved with Keras model.save()
MODEL_PATH = 'models/resnet50_embed.h5'
# Load your own trained model
model = load_model(MODEL_PATH)
model._make_predict_function()          # Necessary
print('Model loaded. Start serving...Check http://127.0.0.1:5000/')

def get_embedding(model, img_input):
    # Reshape
    img_input = img_input.resize((224, 224))
    # img to Array
    x = image.img_to_array(img_input)
    # Expand Dim (1, w, h)
    x = np.expand_dims(x, axis=0)
    # Pre process Input
    x = preprocess_input(x)
    return model.predict(x).reshape(-1)

def get_recommender(idx, df, cosine_sim, indices, top_n=5):
        indices = pd.Series(range(len(df)), index=df.index)
        sim_idx = indices[idx]
        sim_scores = list(enumerate(cosine_sim[sim_idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:top_n + 1]
        idx_rec = [i[0] for i in sim_scores]
        idx_sim = [i[1] for i in sim_scores]
        return indices.iloc[idx_rec].index, idx_sim

@app.route('/', methods=['GET'])
def index():
    # Main page
    return render_template('index.html')

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        # Get the image from post request
        img = base64_to_pil(request.json)
        # Save the image to ./uploads
        # img.save("./uploads/image.png")
        # Make prediction
        preds = get_embedding(model, img)
        f = open('store.pckl', 'rb')
        df, df_embs = pickle.load(f)
        f.close()
        # append extracted features to dataset
        df_embs = df_embs.append(pd.Series(preds), ignore_index=True)
        # compute cos similarities between objects:
        cosine_sim = 1 - pairwise_distances(df_embs, metric='cosine')
        # indices = pd.Series(range(len(df)), index=df.index)
        # return top-10 similar items for input image. It's index in the dataframe is 5000 (the last row)
        #idx_rec, idx_sim = get_recommender(5000, df, cosine_sim, indices, top_n=10)
        top_n = 3
        sim_scores = list(enumerate(cosine_sim[-1]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:top_n + 1]
        idx_rec = [i[0] for i in sim_scores]
        idx_sim = [i[1] for i in sim_scores]

        out = df[['images.model','shortDescription','priceInfo.finalPrice']].loc[idx_rec].to_json(orient='index')
        # Serialize the result, you can add additional fields
        return jsonify(out)

    return None

if __name__ == '__main__':
    #app.run(port=5002, threaded=False)
    # Serve the app with gevent
    http_server = WSGIServer(('0.0.0.0', 5000), app)
    http_server.serve_forever()








# def model_predict(img, model):
#     img = img.resize((224, 224))
#
#     # Preprocessing the image
#     x = image.img_to_array(img)
#     # x = np.true_divide(x, 255)
#     x = np.expand_dims(x, axis=0)
#
#     # Be careful how your trained model deals with the input
#     # otherwise, it won't make correct prediction!
#     x = preprocess_input(x, mode='tf')
#
#     preds = model.predict(x)
#     return preds