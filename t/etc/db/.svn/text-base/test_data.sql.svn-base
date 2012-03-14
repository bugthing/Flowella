
INSERT INTO charts (id, name) VALUES(91001, 'Chart for Tests');

INSERT INTO sections (id, chart_id, name, weight) VALUES(92001, 91001, 'Section 1', 1);
INSERT INTO sections (id, chart_id, name, weight) VALUES(92002, 91001, 'Section 2', 2);
INSERT INTO sections (id, chart_id, name, weight) VALUES(92003, 91001, 'Section 3', 3);
INSERT INTO sections (id, chart_id, name, weight) VALUES(92004, 91001, 'Section 4', 4);

INSERT INTO section_lines (id, section_id, tool_ref, weight, params) VALUES(93001, 92001, 'text', 1, '{"display_text":"Welcome to the test"}');
INSERT INTO section_lines (id, section_id, tool_ref, weight, params) VALUES(93002, 92001, 'buttons_next', 2, '{"buttons_next_label_1":"Click A","buttons_next_section_1":"92002"}');
INSERT INTO section_lines (id, section_id, tool_ref, weight, params) VALUES(93003, 92001, 'buttons_next', 3, '{"buttons_next_label_1":"Click B","buttons_next_section_1":"92003"}');

INSERT INTO section_lines (id, section_id, tool_ref, weight, params) VALUES(93004, 92002, 'text', 1, '{"display_text":"Finished A"}');

INSERT INTO section_lines (id, section_id, tool_ref, weight, params) VALUES(93005, 92003, 'text_box', 1, '{"data_column":"test_data_col_a","display_text":"Some test data please"}');
INSERT INTO section_lines (id, section_id, tool_ref, weight, params) VALUES(93006, 92003, 'buttons_next', 2, '{"buttons_next_label_1":"Click C","buttons_next_section_1":"92004"}');

INSERT INTO section_lines (id, section_id, tool_ref, weight, params) VALUES(93007, 92004, 'text', 1, '{"display_text":"Finished B"}');

