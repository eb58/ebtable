const basketTestdata = [
  ['C1-HEADER', 'XXXXXX', '', '', '', '', '', '', '', '', ''],
  ['C1', '', '05.08.2011', 'Liebig, Ellen, 17.08.1956', '02.05.2011 17:50:43', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '02.05.2011', '01,02,07,08,99'],
  ['C1', '', '10.06.2013', 'Heine, Heinrich, 07.12.2006', '27.05.2013 12:14:06', 'TestSortierung', 'Frage 251', '', 'Annika Borgmann', '27.05.2013', '99'],
  ['C1', '', '15.08.2014', 'Manne, Antonia, 17.06.1954', '14.04.2011 18:17:10', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '14.04.2011', '01,08,99'],
  ['', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 16:15:44', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 17:02:12', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['C2-HEADER', '', '', '', '', '', '', '', '', '', ''],
  ['C2', '', '', 'Liebig, Ellen, 17.08.1956', '17.06.2011 14:31:33', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Eins Sekretin ', '17.06.2011', '02,05,07,99'],
  ['C2', '', '', 'ITSO-KH, Cäcilia, 21.07.1977', '21.07.2011 10:18:10', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Mario Mustermann', '21.07.2011', '99'],
  ['', '', '', 'Krause, Ingo, 09.03.1945', '08.08.2011 15:01:57', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Annika Borgmann', '08.08.2011', '01,99'],
  ['', '', '', 'aaaaaaaa, b_aaaaaaaa, 01.11.1971', '08.08.2011 17:21:25', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Mario Mustermann', '08.08.2011', '99'],
  ['', '', '', 'Test1, Sieg€fried, 10.03.2010', '26.09.2011 13:43:31', '', 'Leistungen der Behindertenhilfe (§ 43a SGB XI)', '', 'Mario Mustermann', '26.09.2011', '13,99'],
  ['', '', '', 'Baumeister, Isolde, 15.12.1958', '18.06.2013 10:38:28', '', 'Frage 251', 'KH-Gutachten', 'BZ 1 - Auftragsvorbereitung', '18.06.2013', '01,03,05,07,17,21,99'],
  ['', '', '', 'Aschiller, El`friede, 05.06.1952', '09.06.2011 20:51:14', '', 'Frage 251', 'KH-Gutachten', 'Zwei Sekretin', '09.06.2011', '99'],
  ['', '', '', 'Strittmatter, Erwin, 15.08.1943', '07.06.2011 18:15:42', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', 'KH-Gutachten', 'Zwei Sekretin', '07.06.2011', '02,05,99'],
  ['', '', '', 'Henkel, Gerlinde, 04.06.1945', '07.06.2011 14:08:42', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Daniel Schempf', '07.06.2011', '01,02,03,05,99'],
  ['A1-HEADER', '', '', '', '', '', '', '', '', '', ''],
  ['A1', '', '', 'Feh, Sepp, 01.01.1978', '20.07.2011 12:54:35', 'MeinTest', 'Notwendigkeit und Dauer der stationären Krankenhausbehandlung (§112 Abs.2 Nr.2 SGB V)', 'KH-Gutachten', 'BZ 1 - Disponent', '20.07.2011', '02,99'],
  ['A1', '', '05.08.2011', 'Liebig, Ellen, 17.08.1956', '02.05.2011 17:50:43', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '02.05.2011', '01,02,07,08,99'],
  ['A1', '', '10.06.2013', 'Heine, Heinrich, 07.12.2010', '27.05.2013 12:14:06', 'TestSortierung', 'Frage 251', '', 'Annika Borgmann', '27.05.2013', '99'],
  ['A1', '', '15.08.2014', 'Manne, Antonia, 17.06.1954', '14.04.2011 18:17:10', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '14.04.2011', '01,08,99'],
  ['A1', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 16:15:44', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 17:02:12', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '', 'Liebig, Ellen, 17.08.1956', '17.06.2011 14:31:33', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Eins Sekretin ', '17.06.2011', '02,05,07,99'],
  ['', '', '', 'ITSO-KH, Cäcilia, 21.07.1977', '21.07.2011 10:18:10', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Mario Mustermann', '21.07.2011', '99'],
  ['', '', '', 'Krause, Ingo, 09.03.1945', '08.08.2011 15:01:57', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Annika Borgmann', '08.08.2011', '01,99'],
  ['', '', '', 'aaaaaaaa, b_aaaaaaaa, 01.11.1971', '08.08.2011 17:21:25', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Mario Mustermann', '08.08.2011', '99'],
  ['', '', '', 'Test1, Sieg€fried, 10.03.2010', '26.09.2011 13:43:31', '', 'Leistungen der Behindertenhilfe (§ 43a SGB XI)', '', 'Mario Mustermann', '26.09.2011', '13,99'],
  ['', '', '', 'Baumeister, Isolde, 15.12.1958', '18.06.2013 10:38:28', '', 'Frage 251', 'KH-Gutachten', 'BZ 1 - Auftragsvorbereitung', '18.06.2013', '01,03,05,07,17,21,99'],
  ['', '', '', 'Aschiller, El`friede, 05.06.1952', '09.06.2011 20:51:14', '', 'Frage 251', 'KH-Gutachten', 'Zwei Sekretin', '09.06.2011', '99'],
  ['', '', '', 'Strittmatter, Erwin, 15.08.1943', '07.06.2011 18:15:42', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', 'KH-Gutachten', 'Zwei Sekretin', '07.06.2011', '02,05,99'],
  ['', '', '', 'Henkel, Gerlinde, 04.06.1945', '07.06.2011 14:08:42', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Daniel Schempf', '07.06.2011', '01,02,03,05,99'],
  ['X-HEADER', '', '', '', '', '', '', '', '', '', ''],
  ['X', '', '', 'Feh, Sepp, 01.01.1978', '20.07.2011 12:54:35', 'MeinTest', 'Notwendigkeit und Dauer der stationären Krankenhausbehandlung (§112 Abs.2 Nr.2 SGB V)', 'KH-Gutachten', 'BZ 1 - Disponent', '20.07.2011', '02,99'],
  ['X', '', '05.08.2011', 'Liebig, Ellen, 17.08.1956', '02.05.2011 17:50:43', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '02.05.2011', '01,02,07,08,99'],
  ['X', '', '10.06.2013', 'Heine, Heinrich, 07.12.2011', '27.05.2013 12:14:06', 'TestSortierung', 'Frage 251', '', 'Annika Borgmann', '27.05.2013', '99'],
  ['X', '', '15.08.2014', 'Manne, Antonia, 17.06.1954', '14.04.2011 18:17:10', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '14.04.2011', '01,08,99'],
  ['X', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 16:15:44', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['X', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 17:02:12', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '', 'Liebig, Ellen, 17.08.1956', '17.06.2011 14:31:33', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Eins Sekretin ', '17.06.2011', '02,05,07,99'],
  ['', '', '', 'ITSO-KH, Cäcilia, 21.07.1977', '21.07.2011 10:18:10', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Mario Mustermann', '21.07.2011', '99'],
  ['', '', '', 'Krause, Ingo, 09.03.1945', '08.08.2011 15:01:57', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Annika Borgmann', '08.08.2011', '01,99'],
  ['', '', '', 'aaaaaaaa, b_aaaaaaaa, 01.11.1971', '08.08.2011 17:21:25', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Mario Mustermann', '08.08.2011', '99'],
  ['', '', '', 'Test1, Sieg€fried, 10.03.2010', '26.09.2011 13:43:31', '', 'Leistungen der Behindertenhilfe (§ 43a SGB XI)', '', 'Mario Mustermann', '26.09.2011', '13,99'],
  ['', '', '', 'Baumeister, Isolde, 15.12.1958', '18.06.2013 10:38:28', '', 'Frage 251', 'KH-Gutachten', 'BZ 1 - Auftragsvorbereitung', '18.06.2013', '01,03,05,07,17,21,99'],
  ['', '', '', 'Aschiller, El`friede, 05.06.1952', '09.06.2011 20:51:14', '', 'Frage 251', 'KH-Gutachten', 'Zwei Sekretin', '09.06.2011', '99'],
  ['', '', '', 'Strittmatter, Erwin, 15.08.1943', '07.06.2011 18:15:42', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', 'KH-Gutachten', 'Zwei Sekretin', '07.06.2011', '02,05,99'],
  ['', '', '', 'Henkel, Gerlinde, 04.06.1945', '07.06.2011 14:08:42', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Daniel Schempf', '07.06.2011', '01,02,03,05,99'],
  ['', '', '', 'Feh, Sepp, 01.01.1978', '20.07.2011 12:54:35', 'MeinTest', 'Notwendigkeit und Dauer der stationären Krankenhausbehandlung (§112 Abs.2 Nr.2 SGB V)', 'KH-Gutachten', 'BZ 1 - Disponent', '20.07.2011', '02,99'],
  ['C1-HEADER', 'XXXXXX', '', '', '', '', '', '', '', '', ''],
  ['C1', '', '05.08.2011', 'Liebig, Ellen, 17.08.1956', '02.05.2011 17:50:43', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '02.05.2011', '01,02,07,08,99'],
  ['C1', '', '10.06.2013', 'Heine, Heinrich, 07.12.2006', '27.05.2013 12:14:06', 'TestSortierung', 'Frage 251', '', 'Annika Borgmann', '27.05.2013', '99'],
  ['C1', '', '15.08.2014', 'Manne, Antonia, 17.06.1954', '14.04.2011 18:17:10', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '14.04.2011', '01,08,99'],
  ['', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 16:15:44', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 17:02:12', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['C2-HEADER', '', '', '', '', '', '', '', '', '', ''],
  ['C2', '', '', 'Liebig, Ellen, 17.08.1956', '17.06.2011 14:31:33', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Eins Sekretin ', '17.06.2011', '02,05,07,99'],
  ['C2', '', '', 'ITSO-KH, Cäcilia, 21.07.1977', '21.07.2011 10:18:10', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Mario Mustermann', '21.07.2011', '99'],
  ['', '', '', 'Krause, Ingo, 09.03.1945', '08.08.2011 15:01:57', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Annika Borgmann', '08.08.2011', '01,99'],
  ['', '', '', 'aaaaaaaa, b_aaaaaaaa, 01.11.1971', '08.08.2011 17:21:25', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Mario Mustermann', '08.08.2011', '99'],
  ['', '', '', 'Test1, Sieg€fried, 10.03.2010', '26.09.2011 13:43:31', '', 'Leistungen der Behindertenhilfe (§ 43a SGB XI)', '', 'Mario Mustermann', '26.09.2011', '13,99'],
  ['', '', '', 'Baumeister, Isolde, 15.12.1958', '18.06.2013 10:38:28', '', 'Frage 251', 'KH-Gutachten', 'BZ 1 - Auftragsvorbereitung', '18.06.2013', '01,03,05,07,17,21,99'],
  ['', '', '', 'Aschiller, El`friede, 05.06.1952', '09.06.2011 20:51:14', '', 'Frage 251', 'KH-Gutachten', 'Zwei Sekretin', '09.06.2011', '99'],
  ['', '', '', 'Strittmatter, Erwin, 15.08.1943', '07.06.2011 18:15:42', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', 'KH-Gutachten', 'Zwei Sekretin', '07.06.2011', '02,05,99'],
  ['', '', '', 'Henkel, Gerlinde, 04.06.1945', '07.06.2011 14:08:42', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Daniel Schempf', '07.06.2011', '01,02,03,05,99'],
  ['A1-HEADER', '', '', '', '', '', '', '', '', '', ''],
  ['A1', '', '', 'Feh, Sepp, 01.01.1978', '20.07.2011 12:54:35', 'MeinTest', 'Notwendigkeit und Dauer der stationären Krankenhausbehandlung (§112 Abs.2 Nr.2 SGB V)', 'KH-Gutachten', 'BZ 1 - Disponent', '20.07.2011', '02,99'],
  ['A1', '', '05.08.2011', 'Liebig, Ellen, 17.08.1956', '02.05.2011 17:50:43', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '02.05.2011', '01,02,07,08,99'],
  ['A1', '', '10.06.2013', 'Heine, Heinrich, 07.12.2010', '27.05.2013 12:14:06', 'TestSortierung', 'Frage 251', '', 'Annika Borgmann', '27.05.2013', '99'],
  ['A1', '', '15.08.2014', 'Manne, Antonia, 17.06.1954', '14.04.2011 18:17:10', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '14.04.2011', '01,08,99'],
  ['A1', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 16:15:44', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 17:02:12', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '', 'Liebig, Ellen, 17.08.1956', '17.06.2011 14:31:33', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Eins Sekretin ', '17.06.2011', '02,05,07,99'],
  ['', '', '', 'ITSO-KH, Cäcilia, 21.07.1977', '21.07.2011 10:18:10', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Mario Mustermann', '21.07.2011', '99'],
  ['', '', '', 'Krause, Ingo, 09.03.1945', '08.08.2011 15:01:57', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Annika Borgmann', '08.08.2011', '01,99'],
  ['', '', '', 'aaaaaaaa, b_aaaaaaaa, 01.11.1971', '08.08.2011 17:21:25', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Mario Mustermann', '08.08.2011', '99'],
  ['', '', '', 'Test1, Sieg€fried, 10.03.2010', '26.09.2011 13:43:31', '', 'Leistungen der Behindertenhilfe (§ 43a SGB XI)', '', 'Mario Mustermann', '26.09.2011', '13,99'],
  ['', '', '', 'Baumeister, Isolde, 15.12.1958', '18.06.2013 10:38:28', '', 'Frage 251', 'KH-Gutachten', 'BZ 1 - Auftragsvorbereitung', '18.06.2013', '01,03,05,07,17,21,99'],
  ['', '', '', 'Aschiller, El`friede, 05.06.1952', '09.06.2011 20:51:14', '', 'Frage 251', 'KH-Gutachten', 'Zwei Sekretin', '09.06.2011', '99'],
  ['', '', '', 'Strittmatter, Erwin, 15.08.1943', '07.06.2011 18:15:42', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', 'KH-Gutachten', 'Zwei Sekretin', '07.06.2011', '02,05,99'],
  ['', '', '', 'Henkel, Gerlinde, 04.06.1945', '07.06.2011 14:08:42', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Daniel Schempf', '07.06.2011', '01,02,03,05,99'],
  ['X-HEADER', '', '', '', '', '', '', '', '', '', ''],
  ['X', '', '', 'Feh, Sepp, 01.01.1978', '20.07.2011 12:54:35', 'MeinTest', 'Notwendigkeit und Dauer der stationären Krankenhausbehandlung (§112 Abs.2 Nr.2 SGB V)', 'KH-Gutachten', 'BZ 1 - Disponent', '20.07.2011', '02,99'],
  ['X', '', '05.08.2011', 'Liebig, Ellen, 17.08.1956', '02.05.2011 17:50:43', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '02.05.2011', '01,02,07,08,99'],
  ['X', '', '10.06.2013', 'Heine, Heinrich, 07.12.2011', '27.05.2013 12:14:06', 'TestSortierung', 'Frage 251', '', 'Annika Borgmann', '27.05.2013', '99'],
  ['X', '', '15.08.2014', 'Manne, Antonia, 17.06.1954', '14.04.2011 18:17:10', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '14.04.2011', '01,08,99'],
  ['X', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 16:15:44', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['X', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 17:02:12', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '', 'Liebig, Ellen, 17.08.1956', '17.06.2011 14:31:33', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Eins Sekretin ', '17.06.2011', '02,05,07,99'],
  ['', '', '', 'ITSO-KH, Cäcilia, 21.07.1977', '21.07.2011 10:18:10', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Mario Mustermann', '21.07.2011', '99'],
  ['', '', '', 'Krause, Ingo, 09.03.1945', '08.08.2011 15:01:57', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Annika Borgmann', '08.08.2011', '01,99'],
  ['', '', '', 'aaaaaaaa, b_aaaaaaaa, 01.11.1971', '08.08.2011 17:21:25', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Mario Mustermann', '08.08.2011', '99'],
  ['', '', '', 'Test1, Sieg€fried, 10.03.2010', '26.09.2011 13:43:31', '', 'Leistungen der Behindertenhilfe (§ 43a SGB XI)', '', 'Mario Mustermann', '26.09.2011', '13,99'],
  ['', '', '', 'Baumeister, Isolde, 15.12.1958', '18.06.2013 10:38:28', '', 'Frage 251', 'KH-Gutachten', 'BZ 1 - Auftragsvorbereitung', '18.06.2013', '01,03,05,07,17,21,99'],
  ['', '', '', 'Aschiller, El`friede, 05.06.1952', '09.06.2011 20:51:14', '', 'Frage 251', 'KH-Gutachten', 'Zwei Sekretin', '09.06.2011', '99'],
  ['', '', '', 'Strittmatter, Erwin, 15.08.1943', '07.06.2011 18:15:42', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', 'KH-Gutachten', 'Zwei Sekretin', '07.06.2011', '02,05,99'],
  ['', '', '', 'Henkel, Gerlinde, 04.06.1945', '07.06.2011 14:08:42', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Daniel Schempf', '07.06.2011', '01,02,03,05,99'],
  ['', '', '', 'Feh, Sepp, 01.01.1978', '20.07.2011 12:54:35', 'MeinTest', 'Notwendigkeit und Dauer der stationären Krankenhausbehandlung (§112 Abs.2 Nr.2 SGB V)', 'KH-Gutachten', 'BZ 1 - Disponent', '20.07.2011', '02,99'],
  ['C1-HEADER', 'XXXXXX', '', '', '', '', '', '', '', '', ''],
  ['C1', '', '05.08.2011', 'Liebig, Ellen, 17.08.1956', '02.05.2011 17:50:43', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '02.05.2011', '01,02,07,08,99'],
  ['C1', '', '10.06.2013', 'Heine, Heinrich, 07.12.2006', '27.05.2013 12:14:06', 'TestSortierung', 'Frage 251', '', 'Annika Borgmann', '27.05.2013', '99'],
  ['C1', '', '15.08.2014', 'Manne, Antonia, 17.06.1954', '14.04.2011 18:17:10', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '14.04.2011', '01,08,99'],
  ['', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 16:15:44', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 17:02:12', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['C2-HEADER', '', '', '', '', '', '', '', '', '', ''],
  ['C2', '', '', 'Liebig, Ellen, 17.08.1956', '17.06.2011 14:31:33', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Eins Sekretin ', '17.06.2011', '02,05,07,99'],
  ['C2', '', '', 'ITSO-KH, Cäcilia, 21.07.1977', '21.07.2011 10:18:10', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Mario Mustermann', '21.07.2011', '99'],
  ['', '', '', 'Krause, Ingo, 09.03.1945', '08.08.2011 15:01:57', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Annika Borgmann', '08.08.2011', '01,99'],
  ['', '', '', 'aaaaaaaa, b_aaaaaaaa, 01.11.1971', '08.08.2011 17:21:25', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Mario Mustermann', '08.08.2011', '99'],
  ['', '', '', 'Test1, Sieg€fried, 10.03.2010', '26.09.2011 13:43:31', '', 'Leistungen der Behindertenhilfe (§ 43a SGB XI)', '', 'Mario Mustermann', '26.09.2011', '13,99'],
  ['', '', '', 'Baumeister, Isolde, 15.12.1958', '18.06.2013 10:38:28', '', 'Frage 251', 'KH-Gutachten', 'BZ 1 - Auftragsvorbereitung', '18.06.2013', '01,03,05,07,17,21,99'],
  ['', '', '', 'Aschiller, El`friede, 05.06.1952', '09.06.2011 20:51:14', '', 'Frage 251', 'KH-Gutachten', 'Zwei Sekretin', '09.06.2011', '99'],
  ['', '', '', 'Strittmatter, Erwin, 15.08.1943', '07.06.2011 18:15:42', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', 'KH-Gutachten', 'Zwei Sekretin', '07.06.2011', '02,05,99'],
  ['', '', '', 'Henkel, Gerlinde, 04.06.1945', '07.06.2011 14:08:42', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Daniel Schempf', '07.06.2011', '01,02,03,05,99'],
  ['A1-HEADER', '', '', '', '', '', '', '', '', '', ''],
  ['A1', '', '', 'Feh, Sepp, 01.01.1978', '20.07.2011 12:54:35', 'MeinTest', 'Notwendigkeit und Dauer der stationären Krankenhausbehandlung (§112 Abs.2 Nr.2 SGB V)', 'KH-Gutachten', 'BZ 1 - Disponent', '20.07.2011', '02,99'],
  ['A1', '', '05.08.2011', 'Liebig, Ellen, 17.08.1956', '02.05.2011 17:50:43', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '02.05.2011', '01,02,07,08,99'],
  ['A1', '', '10.06.2013', 'Heine, Heinrich, 07.12.2010', '27.05.2013 12:14:06', 'TestSortierung', 'Frage 251', '', 'Annika Borgmann', '27.05.2013', '99'],
  ['A1', '', '15.08.2014', 'Manne, Antonia, 17.06.1954', '14.04.2011 18:17:10', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '14.04.2011', '01,08,99'],
  ['A1', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 16:15:44', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 17:02:12', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '', 'Liebig, Ellen, 17.08.1956', '17.06.2011 14:31:33', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Eins Sekretin ', '17.06.2011', '02,05,07,99'],
  ['', '', '', 'ITSO-KH, Cäcilia, 21.07.1977', '21.07.2011 10:18:10', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Mario Mustermann', '21.07.2011', '99'],
  ['', '', '', 'Krause, Ingo, 09.03.1945', '08.08.2011 15:01:57', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Annika Borgmann', '08.08.2011', '01,99'],
  ['', '', '', 'aaaaaaaa, b_aaaaaaaa, 01.11.1971', '08.08.2011 17:21:25', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Mario Mustermann', '08.08.2011', '99'],
  ['', '', '', 'Test1, Sieg€fried, 10.03.2010', '26.09.2011 13:43:31', '', 'Leistungen der Behindertenhilfe (§ 43a SGB XI)', '', 'Mario Mustermann', '26.09.2011', '13,99'],
  ['', '', '', 'Baumeister, Isolde, 15.12.1958', '18.06.2013 10:38:28', '', 'Frage 251', 'KH-Gutachten', 'BZ 1 - Auftragsvorbereitung', '18.06.2013', '01,03,05,07,17,21,99'],
  ['', '', '', 'Aschiller, El`friede, 05.06.1952', '09.06.2011 20:51:14', '', 'Frage 251', 'KH-Gutachten', 'Zwei Sekretin', '09.06.2011', '99'],
  ['', '', '', 'Strittmatter, Erwin, 15.08.1943', '07.06.2011 18:15:42', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', 'KH-Gutachten', 'Zwei Sekretin', '07.06.2011', '02,05,99'],
  ['', '', '', 'Henkel, Gerlinde, 04.06.1945', '07.06.2011 14:08:42', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Daniel Schempf', '07.06.2011', '01,02,03,05,99'],
  ['X-HEADER', '', '', '', '', '', '', '', '', '', ''],
  ['X', '', '', 'Feh, Sepp, 01.01.1978', '20.07.2011 12:54:35', 'MeinTest', 'Notwendigkeit und Dauer der stationären Krankenhausbehandlung (§112 Abs.2 Nr.2 SGB V)', 'KH-Gutachten', 'BZ 1 - Disponent', '20.07.2011', '02,99'],
  ['X', '', '05.08.2011', 'Liebig, Ellen, 17.08.1956', '02.05.2011 17:50:43', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '02.05.2011', '01,02,07,08,99'],
  ['X', '', '10.06.2013', 'Heine, Heinrich, 07.12.2011', '27.05.2013 12:14:06', 'TestSortierung', 'Frage 251', '', 'Annika Borgmann', '27.05.2013', '99'],
  ['X', '', '15.08.2014', 'Manne, Antonia, 17.06.1954', '14.04.2011 18:17:10', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '14.04.2011', '01,08,99'],
  ['X', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 16:15:44', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['X', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 17:02:12', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '', 'Liebig, Ellen, 17.08.1956', '17.06.2011 14:31:33', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Eins Sekretin ', '17.06.2011', '02,05,07,99'],
  ['', '', '', 'ITSO-KH, Cäcilia, 21.07.1977', '21.07.2011 10:18:10', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Mario Mustermann', '21.07.2011', '99'],
  ['', '', '', 'Krause, Ingo, 09.03.1945', '08.08.2011 15:01:57', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Annika Borgmann', '08.08.2011', '01,99'],
  ['', '', '', 'aaaaaaaa, b_aaaaaaaa, 01.11.1971', '08.08.2011 17:21:25', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Mario Mustermann', '08.08.2011', '99'],
  ['', '', '', 'Test1, Sieg€fried, 10.03.2010', '26.09.2011 13:43:31', '', 'Leistungen der Behindertenhilfe (§ 43a SGB XI)', '', 'Mario Mustermann', '26.09.2011', '13,99'],
  ['', '', '', 'Baumeister, Isolde, 15.12.1958', '18.06.2013 10:38:28', '', 'Frage 251', 'KH-Gutachten', 'BZ 1 - Auftragsvorbereitung', '18.06.2013', '01,03,05,07,17,21,99'],
  ['', '', '', 'Aschiller, El`friede, 05.06.1952', '09.06.2011 20:51:14', '', 'Frage 251', 'KH-Gutachten', 'Zwei Sekretin', '09.06.2011', '99'],
  ['', '', '', 'Strittmatter, Erwin, 15.08.1943', '07.06.2011 18:15:42', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', 'KH-Gutachten', 'Zwei Sekretin', '07.06.2011', '02,05,99'],
  ['', '', '', 'Henkel, Gerlinde, 04.06.1945', '07.06.2011 14:08:42', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Daniel Schempf', '07.06.2011', '01,02,03,05,99'],
  ['', '', '', 'Feh, Sepp, 01.01.1978', '20.07.2011 12:54:35', 'MeinTest', 'Notwendigkeit und Dauer der stationären Krankenhausbehandlung (§112 Abs.2 Nr.2 SGB V)', 'KH-Gutachten', 'BZ 1 - Disponent', '20.07.2011', '02,99'],
  ['C1-HEADER', 'XXXXXX', '', '', '', '', '', '', '', '', ''],
  ['C1', '', '05.08.2011', 'Liebig, Ellen, 17.08.1956', '02.05.2011 17:50:43', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '02.05.2011', '01,02,07,08,99'],
  ['C1', '', '10.06.2013', 'Heine, Heinrich, 07.12.2006', '27.05.2013 12:14:06', 'TestSortierung', 'Frage 251', '', 'Annika Borgmann', '27.05.2013', '99'],
  ['C1', '', '15.08.2014', 'Manne, Antonia, 17.06.1954', '14.04.2011 18:17:10', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '14.04.2011', '01,08,99'],
  ['', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 16:15:44', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 17:02:12', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['C2-HEADER', '', '', '', '', '', '', '', '', '', ''],
  ['C2', '', '', 'Liebig, Ellen, 17.08.1956', '17.06.2011 14:31:33', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Eins Sekretin ', '17.06.2011', '02,05,07,99'],
  ['C2', '', '', 'ITSO-KH, Cäcilia, 21.07.1977', '21.07.2011 10:18:10', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Mario Mustermann', '21.07.2011', '99'],
  ['', '', '', 'Krause, Ingo, 09.03.1945', '08.08.2011 15:01:57', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Annika Borgmann', '08.08.2011', '01,99'],
  ['', '', '', 'aaaaaaaa, b_aaaaaaaa, 01.11.1971', '08.08.2011 17:21:25', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Mario Mustermann', '08.08.2011', '99'],
  ['', '', '', 'Test1, Sieg€fried, 10.03.2010', '26.09.2011 13:43:31', '', 'Leistungen der Behindertenhilfe (§ 43a SGB XI)', '', 'Mario Mustermann', '26.09.2011', '13,99'],
  ['', '', '', 'Baumeister, Isolde, 15.12.1958', '18.06.2013 10:38:28', '', 'Frage 251', 'KH-Gutachten', 'BZ 1 - Auftragsvorbereitung', '18.06.2013', '01,03,05,07,17,21,99'],
  ['', '', '', 'Aschiller, El`friede, 05.06.1952', '09.06.2011 20:51:14', '', 'Frage 251', 'KH-Gutachten', 'Zwei Sekretin', '09.06.2011', '99'],
  ['', '', '', 'Strittmatter, Erwin, 15.08.1943', '07.06.2011 18:15:42', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', 'KH-Gutachten', 'Zwei Sekretin', '07.06.2011', '02,05,99'],
  ['', '', '', 'Henkel, Gerlinde, 04.06.1945', '07.06.2011 14:08:42', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Daniel Schempf', '07.06.2011', '01,02,03,05,99'],
  ['A1-HEADER', '', '', '', '', '', '', '', '', '', ''],
  ['A1', '', '', 'Feh, Sepp, 01.01.1978', '20.07.2011 12:54:35', 'MeinTest', 'Notwendigkeit und Dauer der stationären Krankenhausbehandlung (§112 Abs.2 Nr.2 SGB V)', 'KH-Gutachten', 'BZ 1 - Disponent', '20.07.2011', '02,99'],
  ['A1', '', '05.08.2011', 'Liebig, Ellen, 17.08.1956', '02.05.2011 17:50:43', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '02.05.2011', '01,02,07,08,99'],
  ['A1', '', '10.06.2013', 'Heine, Heinrich, 07.12.2010', '27.05.2013 12:14:06', 'TestSortierung', 'Frage 251', '', 'Annika Borgmann', '27.05.2013', '99'],
  ['A1', '', '15.08.2014', 'Manne, Antonia, 17.06.1954', '14.04.2011 18:17:10', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '14.04.2011', '01,08,99'],
  ['A1', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 16:15:44', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 17:02:12', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '', 'Liebig, Ellen, 17.08.1956', '17.06.2011 14:31:33', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Eins Sekretin ', '17.06.2011', '02,05,07,99'],
  ['', '', '', 'ITSO-KH, Cäcilia, 21.07.1977', '21.07.2011 10:18:10', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Mario Mustermann', '21.07.2011', '99'],
  ['', '', '', 'Krause, Ingo, 09.03.1945', '08.08.2011 15:01:57', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Annika Borgmann', '08.08.2011', '01,99'],
  ['', '', '', 'aaaaaaaa, b_aaaaaaaa, 01.11.1971', '08.08.2011 17:21:25', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Mario Mustermann', '08.08.2011', '99'],
  ['', '', '', 'Test1, Sieg€fried, 10.03.2010', '26.09.2011 13:43:31', '', 'Leistungen der Behindertenhilfe (§ 43a SGB XI)', '', 'Mario Mustermann', '26.09.2011', '13,99'],
  ['', '', '', 'Baumeister, Isolde, 15.12.1958', '18.06.2013 10:38:28', '', 'Frage 251', 'KH-Gutachten', 'BZ 1 - Auftragsvorbereitung', '18.06.2013', '01,03,05,07,17,21,99'],
  ['', '', '', 'Aschiller, El`friede, 05.06.1952', '09.06.2011 20:51:14', '', 'Frage 251', 'KH-Gutachten', 'Zwei Sekretin', '09.06.2011', '99'],
  ['', '', '', 'Strittmatter, Erwin, 15.08.1943', '07.06.2011 18:15:42', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', 'KH-Gutachten', 'Zwei Sekretin', '07.06.2011', '02,05,99'],
  ['', '', '', 'Henkel, Gerlinde, 04.06.1945', '07.06.2011 14:08:42', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Daniel Schempf', '07.06.2011', '01,02,03,05,99'],
  ['X-HEADER', '', '', '', '', '', '', '', '', '', ''],
  ['X', '', '', 'Feh, Sepp, 01.01.1978', '20.07.2011 12:54:35', 'MeinTest', 'Notwendigkeit und Dauer der stationären Krankenhausbehandlung (§112 Abs.2 Nr.2 SGB V)', 'KH-Gutachten', 'BZ 1 - Disponent', '20.07.2011', '02,99'],
  ['X', '', '05.08.2011', 'Liebig, Ellen, 17.08.1956', '02.05.2011 17:50:43', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '02.05.2011', '01,02,07,08,99'],
  ['X', '', '10.06.2013', 'Heine, Heinrich, 07.12.2011', '27.05.2013 12:14:06', 'TestSortierung', 'Frage 251', '', 'Annika Borgmann', '27.05.2013', '99'],
  ['X', '', '15.08.2014', 'Manne, Antonia, 17.06.1954', '14.04.2011 18:17:10', '', 'Neuer Grund', 'KH-Gutachten', 'Zwei Gutachter', '14.04.2011', '01,08,99'],
  ['X', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 16:15:44', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['X', '', '15.08.2014', 'Liebig, Ellen, 17.08.1956', '05.05.2011 17:02:12', 'FachDispo', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Bernd Schmider', '05.05.2011', '01,07,99'],
  ['', '', '', 'Liebig, Ellen, 17.08.1956', '17.06.2011 14:31:33', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Eins Sekretin ', '17.06.2011', '02,05,07,99'],
  ['', '', '', 'ITSO-KH, Cäcilia, 21.07.1977', '21.07.2011 10:18:10', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Mario Mustermann', '21.07.2011', '99'],
  ['', '', '', 'Krause, Ingo, 09.03.1945', '08.08.2011 15:01:57', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Annika Borgmann', '08.08.2011', '01,99'],
  ['', '', '', 'aaaaaaaa, b_aaaaaaaa, 01.11.1971', '08.08.2011 17:21:25', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', '', 'Mario Mustermann', '08.08.2011', '99'],
  ['', '', '', 'Test1, Sieg€fried, 10.03.2010', '26.09.2011 13:43:31', '', 'Leistungen der Behindertenhilfe (§ 43a SGB XI)', '', 'Mario Mustermann', '26.09.2011', '13,99'],
  ['', '', '', 'Baumeister, Isolde, 15.12.1958', '18.06.2013 10:38:28', '', 'Frage 251', 'KH-Gutachten', 'BZ 1 - Auftragsvorbereitung', '18.06.2013', '01,03,05,07,17,21,99'],
  ['', '', '', 'Aschiller, El`friede, 05.06.1952', '09.06.2011 20:51:14', '', 'Frage 251', 'KH-Gutachten', 'Zwei Sekretin', '09.06.2011', '99'],
  ['', '', '', 'Strittmatter, Erwin, 15.08.1943', '07.06.2011 18:15:42', '', 'Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz', 'KH-Gutachten', 'Zwei Sekretin', '07.06.2011', '02,05,99'],
  ['', '', '', 'Henkel, Gerlinde, 04.06.1945', '07.06.2011 14:08:42', '', 'DRG ordnungsgemäße Abrechnung', 'KH-Gutachten', 'Daniel Schempf', '07.06.2011', '01,02,03,05,99'],
  ['', '', '', 'Feh, Sepp, 01.01.1978', '20.07.2011 12:54:35', 'MeinTest', 'Notwendigkeit und Dauer der stationären Krankenhausbehandlung (§112 Abs.2 Nr.2 SGB V)', 'KH-Gutachten', 'BZ 1 - Disponent', '20.07.2011', '02,99'],
];