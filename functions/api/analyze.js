
const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const BENEFICS = new Set(["Jupiter","Venus","Mercury","Moon"]);
const MALEFICS = new Set(["Saturn","Mars","Rahu","Ketu","Sun"]);

const signLord = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter"
};

const HOUSE_SIGN_BY_LAGNA = {};
SIGNS.forEach((lagna, idx) => {
  HOUSE_SIGN_BY_LAGNA[lagna] = {};
  for (let h = 1; h <= 12; h += 1) {
    HOUSE_SIGN_BY_LAGNA[lagna][h] = SIGNS[(idx + h - 1) % 12];
  }
});

const DOMAIN_CONFIG = [
  {
    title: "Identity & Personality",
    houses: [1],
    karakas: ["Sun","Moon"],
    overview: "Identity is primarily read from Lagna, Lagna lord, Sun, and Moon. D1 shows how the native expresses self in outer life; D9 shows whether that identity matures into a settled and durable pattern.",
    flagLogic: "Vulnerable appears when Lagna support is weak, key karakas are under pressure, or the self-pattern is not held well in D9. Developing appears when some support exists but the chart does not hold uniformly."
  },
  {
    title: "Wealth & Family",
    houses: [2,11],
    karakas: ["Jupiter","Venus","Mercury"],
    overview: "Wealth and family tone are judged from the 2nd house, gains from the 11th, and support from Jupiter, Venus, and Mercury. D1 shows earning and family pattern; D9 shows whether stability, values, and continuity hold over time.",
    flagLogic: "Vulnerable appears when wealth houses or their lords face affliction, especially with pressure from Saturn, Rahu, Ketu, or Mars. Developing shows mixed support: some earning promise, but uneven retention, family harmony, or gains."
  },
  {
    title: "Marriage & Relationship",
    houses: [7,8,12],
    karakas: ["Venus","Jupiter","Moon"],
    overview: "Marriage is read from the 7th house, 7th lord, Venus, Moon, and the sustaining houses like the 8th and 12th. D1 shows visible relationship promise; D9 shows maturity, endurance, and later-life quality of bond.",
    flagLogic: "Vulnerable appears when relationship houses and Venus are repeatedly pressured in D1 and D9. Developing shows attraction or promise exists, but continuity, emotional balance, or mutual adjustment may need work."
  },
  {
    title: "Career & Earning",
    houses: [10,11,6],
    karakas: ["Sun","Saturn","Mercury","Jupiter"],
    overview: "Career is read from the 10th house, service and effort from the 6th, gains from the 11th, and support from Sun, Saturn, Mercury, and Jupiter. D1 shows active work pattern; D9 shows whether career results mature into stable recognition and earning continuity.",
    flagLogic: "Vulnerable appears when career houses, their lords, and work karakas are pressured with little D9 support. Developing means there is real potential, but movement may be delayed, uneven, or effort-heavy."
  },
  {
    title: "Restraint",
    houses: [12,8],
    karakas: ["Saturn","Ketu","Moon"],
    overview: "Restraint is judged from the 12th house, withdrawal patterns, Saturn’s discipline, Ketu’s detachment, and Moon’s emotional regulation. This domain reflects boundaries, internal control, and how impulses are held or released.",
    flagLogic: "Vulnerable appears when the 12th axis and emotional regulation factors are afflicted, making self-restraint inconsistent. Developing means restraint is present in parts, but not yet steady under pressure."
  },
  {
    title: "Health",
    houses: [6,8,12],
    karakas: ["Sun","Moon","Saturn","Mars"],
    overview: "Health is read from the 6th, 8th, and 12th houses along with vitality from Sun, emotional resilience from Moon, and stress signatures from Saturn and Mars. D1 shows visible health pressure; D9 shows whether recovery and long-run endurance improve or weaken.",
    flagLogic: "Vulnerable appears when dusthana houses and health karakas take repeated pressure. Developing means the chart shows sensitivity or periodic strain, but not a uniformly damaged pattern."
  }
];

function normalizeInputHouses(houses) {
  const out = {};
  for (let i = 1; i <= 12; i += 1) out[i] = Array.isArray(houses?.[i]) ? houses[i] : Array.isArray(houses?.[String(i)]) ? houses[String(i)] : [];
  return out;
}

function getPlanetHouse(houses, planet) {
  for (let i = 1; i <= 12; i += 1) {
    if ((houses[i] || []).includes(planet)) return i;
  }
  return null;
}

function houseSign(lagnaSign, houseNum) {
  return HOUSE_SIGN_BY_LAGNA[lagnaSign][houseNum];
}

function scoreChartDomain(chart, config) {
  const houses = normalizeInputHouses(chart.houses);
  const lagna = chart.lagnaSign;
  let score = 0;
  const flags = [];
  const reasons = [];

  config.houses.forEach(houseNum => {
    const housePlanets = houses[houseNum] || [];
    const beneficCount = housePlanets.filter(p => BENEFICS.has(p)).length;
    const maleficCount = housePlanets.filter(p => MALEFICS.has(p)).length;
    const sign = houseSign(lagna, houseNum);
    const lord = signLord[sign];
    const lordHouse = getPlanetHouse(houses, lord);

    score += beneficCount * 2;
    score -= maleficCount * 2;

    if (beneficCount > 0) {
      reasons.push(`House ${houseNum} gains support from ${housePlanets.filter(p => BENEFICS.has(p)).join(', ')}.`);
    }
    if (maleficCount > 0) {
      reasons.push(`House ${houseNum} faces pressure from ${housePlanets.filter(p => MALEFICS.has(p)).join(', ')}.`);
    }

    if (lordHouse === null) {
      score -= 1;
      flags.push(`house-${houseNum}-lord-missing`);
    } else if ([1,4,5,7,9,10,11].includes(lordHouse)) {
      score += 2;
      reasons.push(`House ${houseNum} lord ${lord} is placed in house ${lordHouse}, giving structural support.`);
    } else if ([6,8,12].includes(lordHouse)) {
      score -= 2;
      flags.push(`house-${houseNum}-lord-under-stress`);
      reasons.push(`House ${houseNum} lord ${lord} sits in house ${lordHouse}, reducing ease and continuity.`);
    } else {
      score += 0;
      reasons.push(`House ${houseNum} lord ${lord} sits in house ${lordHouse}, giving average support.`);
    }
  });

  config.karakas.forEach(planet => {
    const pHouse = getPlanetHouse(houses, planet);
    if (pHouse === null) return;
    if ([1,4,5,7,9,10,11].includes(pHouse)) {
      score += 1;
      reasons.push(`${planet} supports the domain from house ${pHouse}.`);
    } else if ([6,8,12].includes(pHouse)) {
      score -= 1;
      flags.push(`${planet.toLowerCase()}-under-pressure`);
      reasons.push(`${planet} sits in house ${pHouse}, adding strain to this domain.`);
    }
  });

  const dStrength = score >= 4 ? "Strong" : score <= -2 ? "Weak" : "Developing";
  return { score, strength: dStrength, flags, reasons };
}

function combineVerdict(d1Strength, d9Strength) {
  if (d1Strength === "Strong" && d9Strength === "Strong") return "Stable";
  if (d1Strength === "Weak" && d9Strength === "Weak") return "Vulnerable";
  if (d1Strength === "Strong" && d9Strength === "Weak") return "Early promise, later inconsistency";
  if (d1Strength === "Weak" && d9Strength === "Strong") return "Delayed but improving";
  if (d1Strength === "Developing" && d9Strength === "Developing") return "Developing";
  if (d1Strength === "Strong" || d9Strength === "Strong") return "Moderately supported";
  return "Developing";
}

function buildSummary(domains) {
  const stableCount = domains.filter(d => d.verdict === "Stable").length;
  const vulnerableCount = domains.filter(d => d.verdict === "Vulnerable").length;
  const improvingCount = domains.filter(d => d.verdict === "Delayed but improving").length;

  let overallPattern = "Balanced with selective strengths and work areas.";
  if (stableCount >= 3) overallPattern = "Chart shows broad structural support across important life domains.";
  if (vulnerableCount >= 3) overallPattern = "Chart shows repeated stress signatures and needs careful handling across major domains.";
  if (improvingCount >= 2) overallPattern = "Chart suggests early unevenness with noticeable later-life strengthening.";

  const d1Strong = domains.filter(d => d.d1Strength === "Strong").length;
  const d9Strong = domains.filter(d => d.d9Strength === "Strong").length;

  let earlyLife = d1Strong > 2 ? "Outer-life promise is visible early." : "Early-life movement may require effort and correction.";
  let laterLife = d9Strong > 2 ? "Later-life consolidation looks stronger and more settled." : "Later-life results need conscious strengthening for stability.";

  return { overallPattern, earlyLife, laterLife };
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const d1 = { lagnaSign: body?.d1?.lagnaSign, houses: normalizeInputHouses(body?.d1?.houses) };
    const d9 = { lagnaSign: body?.d9?.lagnaSign, houses: normalizeInputHouses(body?.d9?.houses) };

    if (!d1.lagnaSign || !d9.lagnaSign) {
      return Response.json({ error: "D1 and D9 lagna signs are required." }, { status: 400 });
    }

    const domains = DOMAIN_CONFIG.map(config => {
      const d1Result = scoreChartDomain(d1, config);
      const d9Result = scoreChartDomain(d9, config);
      const mergedFlags = Array.from(new Set([...d1Result.flags, ...d9Result.flags]));

      return {
        title: config.title,
        d1Strength: d1Result.strength,
        d9Strength: d9Result.strength,
        verdict: combineVerdict(d1Result.strength, d9Result.strength),
        factorOverview: config.overview,
        flagLogic: config.flagLogic,
        flags: mergedFlags.map(flag => flag.replace(/-/g, ' ')),
        reasons: [...d1Result.reasons.slice(0, 3), ...d9Result.reasons.slice(0, 3)]
      };
    });

    const summary = buildSummary(domains);

    return Response.json({
      generatedAt: new Date().toISOString(),
      summary,
      domains
    });
  } catch (error) {
    return Response.json({ error: error.message || "Unexpected error." }, { status: 500 });
  }
}

