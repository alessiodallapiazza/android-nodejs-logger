CREATE DATABASE ANDROID;

USE ANDROID;

CREATE USER 'android'@'localhost' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON ANDROID.* TO 'android'@'localhost';
FLUSH PRIVILEGES;

DROP TABLE IF EXISTS TBUSERSTATS;
CREATE TABLE TBUSERSTATS
(
    ID           INT           NOT NULL AUTO_INCREMENT,
    ANDROID_ID   VARCHAR(16)   NOT NULL,
    CONNECTED    DATE          NOT NULL,
    INFO         VARCHAR(200)  NOT NULL,
    CONT         INT           NOT NULL,
    PRIMARY KEY (ID)
);
CREATE UNIQUE INDEX IND ON TBUSERSTATS(ANDROID_ID,CONNECTED);
/*
INSERT INTO TBUSERSTATS(IP,CONNECTED,INFO,CONT) VALUES(127.0.0.1,CURDATE(),'NEXUS',1) ON DUPLICATE KEY CONT=CONT+1;
*/

DROP TABLE IF EXISTS TBEXCEPTIONS;
CREATE TABLE TBEXCEPTIONS
(
    ID           INT          NOT NULL,
    EXCEPTIONS   TEXT         NOT NULL,
    CONT         INT          NOT NULL,
    PRIMARY KEY (ID,EXCEPTIONS(255)),
    FOREIGN KEY (ID) REFERENCES TBUSERSTATS(ID)
);
/*
INSERT INTO TBEXCEPTION(ID,EXCEPTIONS,CONT) VALUES((SELECT ID FROM TBUSERSTATS WHERE IP=127.0.0.1 AND CONNECTED=CURDATE()),'ERROR',1) ON DUPLICATE KEY CONT=CONT+1;
*/

DROP TABLE IF EXISTS TBSTATS;
CREATE TABLE TBSTATS
(
    ID           INT          NOT NULL,
    PAGE         VARCHAR(200) NOT NULL,
    CONT         INT          NOT NULL,
    PRIMARY KEY (ID,PAGE),
    FOREIGN KEY (ID) REFERENCES TBUSERSTATS(ID)
);
/*
INSERT INTO TBSTATS(ID,PAGE,CONT) VALUES((SELECT ID FROM TBUSERSTATS WHERE IP=127.0.0.1 AND CONNECTED=CURDATE()),'PAGE',1) ON DUPLICATE KEY CONT=CONT+1;
*/