
--
-- BUILD FLOWELLA
--
BEGIN TRANSACTION;

--
-- CHARTS --> SECTIONS --> SECTION LINES
--

DROP TABLE IF EXISTS charts;
CREATE TABLE charts
(
    id          INTEGER     NOT NULL,
    name        VARCHAR(25) NOT NULL,
    added       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    UNIQUE(name)
);

DROP TABLE IF EXISTS sections;
CREATE TABLE sections
(
    id          INTEGER     NOT NULL,
    chart_id    INTEGER     NOT NULL REFERENCES charts(id),
    name        VARCHAR(25) NOT NULL,
    weight      INTEGER     NOT NULL DEFAULT 0,
    pos_left    INTEGER     NOT NULL DEFAULT 0,
    pos_top     INTEGER     NOT NULL DEFAULT 0,
    added       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    UNIQUE(chart_id, name)
);

DROP TABLE IF EXISTS section_lines;
CREATE TABLE section_lines
(
    id          INTEGER     NOT NULL,
    section_id  INTEGER     NOT NULL REFERENCES sections (id),
    tool_ref    VARCHAR(25) NOT NULL,
    weight      INTEGER     NOT NULL DEFAULT 0,
    params      BLOB        NULL,
    added       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);

--
-- READING -> READ_SECTIONS
--
DROP TABLE IF EXISTS readings;
CREATE TABLE readings
(
    id                      INTEGER     NOT NULL,
    chart_id                INTEGER     NOT NULL REFERENCES charts(id),
    active_read_section_id  INTEGER     NULL     REFERENCES read_sections(id),
    added                   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated                 TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);

DROP TABLE IF EXISTS read_sections;
CREATE TABLE read_sections
(
    id              INTEGER     NOT NULL,
    reading_id      INTEGER     NOT NULL REFERENCES readings(id),
    section_id      INTEGER     NOT NULL REFERENCES sections(id),
    params          BLOB        NULL,
    added           TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);

--
-- DONE
--
COMMIT;
