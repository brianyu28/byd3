/*
 * Crimson-specific byd3 stylesheet
 */

var crimsonStyle = {};

crimsonStyle['axisFontSize'] = 14;

crimsonStyle['lineGraphLineWidth'] = 4;
crimsonStyle['lineGraphAxisWidth'] = 3;

crimsonStyle['pointRadius'] = 8;
crimsonStyle['innerPointRadius'] = 4;
crimsonStyle['mainFont'] = stylesheet['slab'];
crimsonStyle['textFontSerif'] = stylesheet['slab'];
crimsonStyle['textFontSans'] = stylesheet['noto'];
crimsonStyle['axisFont'] = stylesheet['noto'];
crimsonStyle['headlineFont'] = stylesheet['slab'];

crimsonStyle['barColor'] = stylesheet['red'];
crimsonStyle['pointColor'] = stylesheet['black'];

stylesheet['lineGraphDrawPoints'] = true;
stylesheet['pointsHollowCenter'] = true;

stylesheetOverride = crimsonStyle;
