
--
-- Single table of data - supporting the DataTable.pm reader module.
--

DROP TABLE IF EXISTS data_tables;
CREATE TABLE data_tables
(
    id              INTEGER     NOT NULL,
    name            VARCHAR(25) NOT NULL,
    added           TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
    UNIQUE(name)
);

DROP TABLE IF EXISTS data_table_rows;
CREATE TABLE data_table_rows
(
    id              INTEGER     NOT NULL,
    data_table_id   INTEGER     NOT NULL REFERENCES data_tables(id),
    reading_id      INTEGER     NULL,
    row_index       INTEGER     NOT NULL,
    added           TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
    UNIQUE(data_table_id, row_index)
);
DROP TABLE IF EXISTS data_table_cols;
CREATE TABLE data_table_cols
(
    id                  INTEGER     NOT NULL,
    data_table_row_id   INTEGER     NOT NULL REFERENCES data_table_rows(id),
    column_name         VARCHAR(50) NOT NULL,
    column_data         BLOB        NOT NULL,
    column_index        INTEGER     NOT NULL,
    added               TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated             TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
    UNIQUE(data_table_row_id, column_name)
);


