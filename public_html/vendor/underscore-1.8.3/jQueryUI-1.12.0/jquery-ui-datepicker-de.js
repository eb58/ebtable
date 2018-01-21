/* German initialisation for the jQuery UI date picker plugin. */
/* Written by Milian Wolff (mail@milianw.de). */
jQuery(function ($) {
  $.datepicker.regional['de'] = {
    clearText: 'l\u00f6schen',
    clearStatus: 'aktuelles Datum l\u00f6schen',
    closeText: 'schlie\u00dfen',
    closeStatus: 'ohne \u00c4nderungen schlie\u00dfen',
    prevText: 'Zur\u00fcck',
    prevStatus: 'letzten Monat zeigen',
    nextText: 'Vor',
    nextStatus: 'n\u00e4chsten Monat zeigen',
    currentText: 'heute',
    currentStatus: '',
    monthNames: ['Januar', 'Februar', 'M\u00e4rz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    monthNamesShort: ['Jan', 'Feb', 'M\u00e4r', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    monthStatus: 'anderen Monat anzeigen',
    yearStatus: 'anderes Jahr anzeigen',
    weekHeader: 'Wo',
    weekStatus: 'Woche des Monats',
    dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    dayNamesShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    dayNamesMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    dayStatus: 'Setze DD als ersten Wochentag',
    dateStatus: 'W\u00e4hle D, M d',
    dateFormat: 'dd.mm.yy',
    firstDay: 1,
    initStatus: 'W\u00e4hle ein Datum',
    isRTL: false
  };
  $.datepicker.setDefaults($.datepicker.regional['de']);
});

var datepickerOptions = {changeMonth: true, changeYear: true, showOn: "button", buttonText: "<i class='fa fa-calendar fa-lg'></i>"};
