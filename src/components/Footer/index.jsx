import React from "react";
import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container-fluid">
        <div className="row justify-content-around">
          <div className="col-8 col-md-5">
            <h5 className={styles.title}>Steganography</h5>
            <p className={styles.description}>
              This is a project about Information Security from TDT University.
            </p>
          </div>
          <div className="col-2">
            <ul className="list-unstyled">
              <li className={styles.footerlink}>
                  Nguyễn Quang Tuấn
              </li>
              <li className={styles.footerlink}>
                  Nguyễn Hữu Tuấn
              </li>
              <li className={styles.footerlink}>
                  Trần Bá Vinh
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
