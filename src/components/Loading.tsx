'use client'

import React from 'react';
import styles from './Loading.module.css';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.skCubeGrid}>
        <div className={`${styles.skCube} ${styles.skCube1}`}></div>
        <div className={`${styles.skCube} ${styles.skCube2}`}></div>
        <div className={`${styles.skCube} ${styles.skCube3}`}></div>
        <div className={`${styles.skCube} ${styles.skCube4}`}></div>
        <div className={`${styles.skCube} ${styles.skCube5}`}></div>
        <div className={`${styles.skCube} ${styles.skCube6}`}></div>
        <div className={`${styles.skCube} ${styles.skCube7}`}></div>
        <div className={`${styles.skCube} ${styles.skCube8}`}></div>
        <div className={`${styles.skCube} ${styles.skCube9}`}></div>
      </div>
      <p className={styles.loadingMessage}>{message}</p>
    </div>
  );
};

export default Loading;