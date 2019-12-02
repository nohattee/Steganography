import io
import os
import numpy as np
import pywt
from PIL import Image

from flask import Flask, jsonify, make_response, send_from_directory, send_file, request
import os
from os.path import exists, join

from constants import CONSTANTS

app = Flask(__name__, static_folder='build')

@app.route('/bin_im/', methods=["POST"])
def bin_im():
    sizeIm = request.get_json()["sizeImage"]
    img = np.random.randint(0,2, (sizeIm,sizeIm)) * 255
    img = Image.fromarray(img.astype("uint8"))
    file_object = io.BytesIO()
    img.save(file_object, 'PNG')
    file_object.seek(0)
    return send_file(file_object, mimetype='image/png')

@app.route('/metrics/', methods=["POST"])
def metric():
    stego = request.files.get('stegano')
    stego = np.array(Image.open(stego).convert("L"))
    cover_name = request.form.get("cover") + ".png"
    path = os.path.abspath(os.path.join(os.getcwd(), "src/assets/imgs/" + cover_name))
    cover = np.array(Image.open(path).convert("L"))

    mse = np.mean((cover - stego) ** 2)
    psnr = 10 * np.log10(255**2/mse)
    return jsonify({"mse": round(mse, 2), "psnr": round(psnr, 2)})

@app.route('/extracting/', methods=["POST"])
def extracting():
    stego = request.files.get('stegano')
    stego = np.array(Image.open(stego).convert("L"))
    bin_im = request.files.get('binIm')
    bin_im = np.array(Image.open(bin_im).convert("L"))

    stego_coeffs = pywt.dwt2(stego, 'haar')
    stego_cA, (stego_cH, stego_cV, stego_cD) = stego_coeffs

    # # Apply SVD to HH band and binary image
    stego_u, stego_s, stego_vh = np.linalg.svd(stego_cD)
    bin_u, bin_s, bin_vh = np.linalg.svd(bin_im)

    HH_old = np.zeros(len(bin_im))

    Sc_diag = np.diag(HH_old)
    Ss_diag = np.diag(stego_s)

    if len(bin_im) < 256:
        Sc_diag[:len(bin_im), :] = Ss_diag[:len(bin_im), :len(bin_im)]
    else:
        Sc_diag[:len(stego_s), :len(stego_s)] = Ss_diag[:len(stego_s), :]

    HH_old = Sc_diag

    extract = np.dot(np.dot(bin_u, HH_old), bin_vh.T)
    img = Image.fromarray(extract).convert("1")

    file_object = io.BytesIO()
    img.save(file_object, 'PNG')
    file_object.seek(0)
    return send_file(file_object, mimetype='image/png')

@app.route('/embedding/', methods=["POST"])
def embedding():
    bin_im = request.files.get('binIm')
    bin_im = np.array(Image.open(bin_im).convert("L"))
    cover_name = request.form.get("cover") + ".png"
    path = os.path.abspath(os.path.join(os.getcwd(), "src/assets/imgs/" + cover_name))
    cover = np.array(Image.open(path).convert("L"))

    cover_coeffs = pywt.dwt2(cover, 'haar')
    cover_cA, (cover_cH, cover_cV, cover_cD) = cover_coeffs

    # Apply SVD to HH band and binary image
    cover_u, cover_s, cover_vh = np.linalg.svd(cover_cD)
    bin_u, bin_s, bin_vh = np.linalg.svd(bin_im)

    # Replace singular values of the HH (high frequency) band with the
    # singular values of the watermark
    bin_s_diag = np.diag(bin_s)
    cover_s_diag = np.diag(cover_s)
    if (bin_im.shape[0] < 256):
        cover_s_diag[:len(bin_im), :len(bin_im)] = bin_s_diag[:len(bin_im), :]
    else:
        cover_s_diag[:len(cover_s), :] = bin_s_diag[:len(cover_s), :len(cover_s)]

    cover_s = cover_s_diag
    HH_new = np.dot(np.dot(cover_u, cover_s), cover_vh.T)

    stego_im = pywt.idwt2((cover_cA, (cover_cH, cover_cV, HH_new)), 'haar')    

    img = Image.fromarray(stego_im).convert("L")
    file_object = io.BytesIO()
    img.save(file_object, 'PNG')
    file_object.seek(0)
    return send_file(file_object, mimetype='image/png')

# Catching all routes
# This route is used to serve all the routes in the frontend application after deployment.
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    file_to_serve = path if path and exists(join(app.static_folder, path)) else 'index.html'
    return send_from_directory(app.static_folder, file_to_serve)

# Error Handler
@app.errorhandler(404)
def page_not_found(error):
    json_response = jsonify({'error': 'Page not found'})
    return make_response(json_response, CONSTANTS['HTTP_STATUS']['404_NOT_FOUND'])

if __name__ == '__main__':
    app.run(debug=True, port=CONSTANTS['PORT'])