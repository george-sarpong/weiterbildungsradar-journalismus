"use strict";
/* Stable, conservative teaching-day projection for old and new course records.
 * This never converts hours/weeks/calendar spans to teaching days by assumption. */
(function () {
  const DAY = "(?:unterrichtstag(?:e|en)?|kurstag(?:e|en)?|pr(?:ä|ae)senzstag(?:e|en)?|tage?|jours?|days?)";
  const NUMBER = "(\\d+(?:[.,]\\d+)?)";
  const PATTERN = new RegExp("(^|[^\\p{L}\\p{N}])" + NUMBER +
    "(?:\\s*[-–—]\\s*" + NUMBER + ")?\\s*" + DAY + "(?![\\p{L}])", "giu");
  const numeric = x => Number(String(x).replace(",", "."));
  const unknown = reason => ({ status: "UNKNOWN", minDays: null, maxDays: null, source: "UNRESOLVED", reason });
  const fromText = text => {
    const source = String(text ?? "").trim();
    if (!source) return unknown("NO_DURATION");
    // "2 Tage pro Woche" describes a recurring rate, not total attendance.
    if (/\\b(?:pro|je)\\s+(?:woche|monat|semester)\\b/i.test(source)
      || /\\b(?:\\d+)\\s*(?:x|×|mal)\\s*\\d+(?:[.,]\\d+)?\\s*(?:tag|tage|jours?|days?)\\b/i.test(source))
      return unknown("RECURRING_OR_MULTIPLIED");
    const matches = [...source.matchAll(PATTERN)];
    if (matches.length !== 1) return unknown(matches.length ? "MULTIPLE_DAY_CLAUSES" : "NO_EXPLICIT_DAYS");
    const [, , first, second] = matches[0];
    const min = numeric(first), max = second == null ? min : numeric(second);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min<=0 || max<min)
      return unknown("INVALID_RANGE");
    if (/\\b(?:ca\\.?|circa|etwa|ungef(?:ä|ae)hr|rund|approximately|approx\\.?)\\s*\\d/i.test(source))
      return unknown("APPROXIMATE_SOURCE_DURATION");
    // Do not silently ignore extra weeks, months or mandatory self-study.
    if (/\\b(?:\\d+\\s*(?:wochen?|monate?|semestern?|weeks?|months?)|zus(?:ä|ae)tzlich\\s+\\d+\\s*stunden?\\s+selbststudium)\\b/i.test(source))
      return unknown("ADDITIONAL_SCHEDULE_OR_WORKLOAD");
    return { status: "KNOWN", minDays: min, maxDays: max, source: "EXPLICIT_DAY_TEXT", reason: null };
  };
  const fromRecord = offer => {
    const stated = offer?.learningTime?.instructionDays;
    if (stated && stated.status === "VERIFIED") {
      const min=stated.min,max=stated.max;
      if (Number.isFinite(min)&&Number.isFinite(max)&&min>0&&max>=min)
        return { status:"KNOWN", minDays:min,maxDays:max,source:"VERIFIED_STRUCTURED",reason:null };
    }
    return fromText(offer?.duration);
  };
  const classify = (offer, maxDays, approximate=false) => {
    if (!Number.isFinite(maxDays) || maxDays<=0) return {status:"FIT",...fromRecord(offer)};
    const duration=fromRecord(offer);
    if(duration.status!=="KNOWN") return {status:"UNKNOWN",...duration};
    if(duration.maxDays<=maxDays) return { ...duration,status:"FIT" };
    if(approximate && duration.minDays<=maxDays+1 && duration.maxDays<=maxDays+1)
      return { ...duration,status:"NEAR" };
    if(duration.minDays>maxDays) return {...duration,status:"OVER"};
    return {...duration,status:"POSSIBLE"};
  };
  const api=Object.freeze({fromText,fromRecord,classify});
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  if(typeof window!=="undefined")window.MEDIA_SKILLS_DURATION=api;
})();
