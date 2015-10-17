var ctm = ctm || {};

ctm.fuzzyStrings = {
    prefixAgo: null,
    prefixFromNow: null,
    suffixAgo: "",
    suffixFromNow: "",
    inPast: 'každú chvíľku',
    seconds: "menej ako pred minútou",
    minute: "okolo minúty",
    minutes: "%d minút",
    minutes2: "%d minúty",
    hour: "okolo 1 hodiny",
    hours: "okolo %d hodín",
    day: "1 deň",
    days2: "%d dni",
    days: "%d dní",
    month: "okolo 1 mesiaca",
    months: "%d mesiacov",
    months2: "%d mesiace",
    year: "okolo 1 roka",
    years: "%d rokov",
    years2: "%d roky",
    wordSeparator: " ",
    numbers: []
};

// shamelessly stolen from http://timeago.yarp.com/, then creatively altered :-)
ctm.fuzzy = function fuzzy(timestamp) {
    var now = Date.now();
    if (timestamp > now) {
        console.warn("Time is in future!", timestamp);
        return timestamp;
    }
    var delta = now - timestamp;
    var $l = this.fuzzyStrings;
    var prefix = $l.prefixAgo;
    var suffix = $l.suffixAgo;

    var seconds = Math.abs(delta) / 1000;
    var minutes = seconds / 60;
    var hours = minutes / 60;
    var days = hours / 24;
    var years = days / 365;

    function substitute(stringOrFunction, number) {
        var string = typeof stringOrFunction == 'function' ? stringOrFunction(number, delta) : stringOrFunction;
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value);
    }

    var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
    seconds < 90 && substitute($l.minute, 1) ||
    minutes < 45 && minutes > 1 && minutes < 5 && substitute($l.minutes2, Math.round(minutes)) ||
    minutes < 45 && minutes >= 5 && substitute($l.minutes, Math.round(minutes)) ||
    //minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
    minutes < 90 && substitute($l.hour, 1) ||
    //hours < 24 && substitute($l.hours, Math.round(hours)) ||
    hours < 24 && hours > 1 && hours < 5 && substitute($l.hours2, Math.round(hours)) ||
    hours < 24 && hours >= 5 && substitute($l.hours, Math.round(hours)) ||
    hours < 42 && substitute($l.day, 1) ||
    //days < 30 && substitute($l.days, Math.round(days)) ||
    days < 30 && days > 1 && days < 5 && substitute($l.days2, Math.round(days)) ||
    days < 30 && days >= 5 && substitute($l.days, Math.round(days)) ||
    days < 45 && substitute($l.month, 1) ||
    //days < 365 && substitute($l.months, Math.round(days / 30)) ||
    days < 365 && months > 1 && months < 5 && substitute($l.months2, Math.round(days / 30)) ||
    days < 365 && months >= 5 && substitute($l.months, Math.round(days / 30)) ||
    years < 1.5 && substitute($l.year, 1) ||
    years > 1.5 && yeras < 5 && substitute($l.years2, Math.round(years)) ||
    substitute($l.years, Math.round(years));

    var separator = $l.wordSeparator || "";
    if ($l.wordSeparator === undefined) { separator = " "; }
    return [prefix, words, suffix].join(separator);
};
