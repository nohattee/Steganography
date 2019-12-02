import React, { useState, Fragment } from "react";
import styles from "./home.module.css";
import cn from "classnames";
import axios from "axios";

export default function Home() {
  const [binIm, setBinIm] = useState("");
  const [cover, setCover] = useState("");
  const [stegano, setStegano] = useState("");
  const [extract, setExtract] = useState("");
  const [metric, setMetric] = useState({"mse": 0, "psnr": 0})

  const onChange = async e => {
    const sizeImage = Number(e.target.value);
    const newBinIm = {
      sizeImage
    };
    try {

      const config = {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const body = JSON.stringify(newBinIm)

      const res = await axios.post("/bin_im/", body, config)
      // const url = URL.createObjectURL(res.data);
      setBinIm(res.data);

      // // It's work
      // const res = await fetch("/bin_im/", {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(newBinIm)
      // });
      // const blob = await res.blob();
      // const url = URL.createObjectURL(blob);
      // console.log(url)
      // setBinIm(url);

    } catch(err) {
      console.error(err);
    }
  };

  const onMetrics = async e => {
    const body = new FormData()

    body.append('stegano', stegano);
    body.append('cover', cover);

    try {
      const config = {
        headers : {
          'Content-Type' : 'multipart/form-data'
        }
      };
      const res = await axios.post("/metrics/", body, config);
      setMetric(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  const onEmbedding = async e => {
    const body = new FormData()

    body.append('binIm', binIm);
    body.append('cover', cover);

    try {
      const config = {
        responseType: 'blob',
        headers : {
          'Content-Type' : 'multipart/form-data'
        }
      };
      const res = await axios.post("/embedding/", body, config);
      // console.log(res.data);
      setStegano(res.data)

    } catch(err) {
      console.error(err);
    }
  };

  const onExtracting = async e => {
    const body = new FormData()

    body.append('binIm', binIm);
    body.append('stegano', stegano);
    try {
      const config = {
        responseType: 'blob',
        headers : {
          'Content-Type' : 'multipart/form-data'
        }
      };
      const res = await axios.post("/extracting/", body, config);
      // console.log(res.data);
      setExtract(res.data)

    } catch(err) {
      console.error(err);
    }
  };

  let embedding = (
    <Fragment>
      <div className="row h-100 mt-5">
        <p><b>Embedding:</b></p>
      </div>
      <div className="row">
        <div className={cn(styles.imageView, "col-sm-6 d-flex align-items-center")}>
          {stegano ? (<img src={URL.createObjectURL(stegano)} 
                              alt="Binary Watermarking"
                              className="img-fluid rounded mx-auto d-block"/>) : (<div></div>)}
        </div>
        <div className="col-sm-6">
          <button type="button" className="btn btn-warning mb-3" onClick={e => onMetrics(e)}>Show Metrics</button>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">MSE</th>
                  <th scope="col">PSNR</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{metric["mse"]}</td>
                  <td>{metric["psnr"]}</td>
                </tr>
              </tbody>
            </table>
        </div>
      </div>
      <div className="row h-100 mt-3">
        <div className="col-sm">
          <button type="button" 
                  className="btn btn-outline-secondary mb-1" 
                  onClick={e => onExtracting(e)}>Start Extracting</button>
        </div>
      </div>
    </Fragment>
  );

  let extracting = (
    <Fragment>
      <div className="row h-100 mt-5">
        <p><b>Extracting:</b></p>
      </div>
      <div className="row">
        <div className={cn(styles.imageView, "col-sm-6 d-flex align-items-center")}>
          {extract ? (<img src={URL.createObjectURL(extract)} 
                              alt="Binary Watermarking"
                              className="img-fluid rounded mx-auto d-block"/>) : (<div></div>)}
        </div>
      </div>
    </Fragment>
  )

  let btnEmb;
  if (binIm && cover) {
    btnEmb = (
              <div className="row h-100">
                <div className="col-sm">
                  <button type="button" 
                          className="btn btn-outline-secondary mb-1" 
                          onClick={e => onEmbedding(e)}>Start Embedding</button>
                </div>
              </div>
    );
  }

  return (
    <Fragment>
      <div className="container h-100">
        <div className="row h-100">
          <p><b>Please choose the cover image</b></p>
        </div>
        <div className="row h-100">
          <div className="d-flex align-items-center">
            <div className="col-sm-4">
              <label htmlFor="baboon">
                <input type="radio" 
                       name="coverImage" 
                       value="baboon" 
                       id="baboon" 
                       onChange={e => setCover(e.target.value)}/>
                <img className="img-fluid" src={require('../../assets/imgs/baboon.png')} alt="Baboon"/>
              </label>
            </div>
            <div className="col-sm-4">
              <label htmlFor="lena">
                <input type="radio" 
                       name="coverImage" 
                       value="lena" 
                       id="lena"
                       onChange={e => setCover(e.target.value)}/>
                <img className="img-fluid" src={require('../../assets/imgs/lena.png')} alt="Lena"/>
              </label>
            </div>
            <div className="col-sm-4">
              <label htmlFor="jet">
                <input type="radio" 
                       name="coverImage" 
                       value="jet" 
                       id="jet"
                       onChange={e => setCover(e.target.value)}/>
                <img className="img-fluid" src={require('../../assets/imgs/jet.png')} alt="Jet"/>
              </label>
            </div>
          </div>
        </div>
        <div className="row h-100">
          <select className="custom-select" defaultValue="default" onChange={e => onChange(e)}>
            <option value="default" disabled>Choose size binary image</option>
            <option value="128">1 of 4 cover image</option>
            <option value="384">3 of 4 cover image</option>
          </select>
        </div>
        <div className="row h-100">
          <div className={cn(styles.imageView, "col-sm d-flex align-items-center")}>
            {binIm ? (<img src={URL.createObjectURL(binIm)} 
                               alt="Binary Watermarking"
                               className="img-fluid rounded mx-auto d-block"/>) : (<div></div>)}
          </div>
        </div>
        {btnEmb}
        {stegano ? embedding : ""}
        {extract ? extracting: ""}
      </div>
    </Fragment>
  );
}
