// GENERATED from measured data on 2026-10-31 — do not hand-edit casually.
//
// These 73 URLs each earned Google impressions, then began returning a hard 404 once
// the backend stopped serving their handout (the API itself 404s — the content was
// removed, not the page). `dynamicParams = false` turns "no content" into a real
// 404, which is honest but throws away the ranking entirely.
//
// A 301 preserves that equity by pointing each dead URL at the closest live page:
// the same course's past-paper page where one exists (18 of them), otherwise the
// public course index (55).
//
// PSY513/finalterm and STA641/finalterm were the #1 and #2 impression earners on the
// whole site. BT402/finalterm was still earning clicks within the last 28 days.
//
// To regenerate: node other/scripts/gsc.mjs pages --days=480, test each for 404,
// then map against the past-paper list.

export interface GoneRedirect {
  from: string;
  to: string;
}

export const geRedirects: GoneRedirect[] = [
  {
    from: "/handout/PSY513/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/BIF601/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/BIO732/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/STA641/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/BIO505T/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/BT402/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/MTH303/midterm",
    to: "/courses",
  },
  {
    from: "/handout/MTH404/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/MTH404/midterm",
    to: "/courses",
  },
  {
    from: "/handout/MTH647/midterm",
    to: "/courses",
  },
  {
    from: "/handout/STA406/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/ZOO201/finalterm",
    to: "/past-papers/ZOO201/midterm",
  },
  {
    from: "/handout/BIO502/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/BT201/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/BT501/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/BT511T/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/CS605/midterm",
    to: "/past-papers/CS605/midterm",
  },
  {
    from: "/handout/CS611/midterm",
    to: "/courses",
  },
  {
    from: "/handout/CS712/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/ENG516/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/ENG522/finalterm",
    to: "/past-papers/ENG522/midterm",
  },
  {
    from: "/handout/MTH646/midterm",
    to: "/courses",
  },
  {
    from: "/handout/PSY404/midterm",
    to: "/courses",
  },
  {
    from: "/handout/BIF101/finalterm",
    to: "/past-papers/BIF101/midterm",
  },
  {
    from: "/handout/BIF401/midterm",
    to: "/past-papers/BIF401/midterm",
  },
  {
    from: "/handout/BIF501/midterm",
    to: "/courses",
  },
  {
    from: "/handout/BIF602/midterm",
    to: "/courses",
  },
  {
    from: "/handout/BIO102/midterm",
    to: "/courses",
  },
  {
    from: "/handout/BIO203/midterm",
    to: "/past-papers/BIO203/midterm",
  },
  {
    from: "/handout/BIO302/midterm",
    to: "/courses",
  },
  {
    from: "/handout/BIO401/midterm",
    to: "/past-papers/BIO401/midterm",
  },
  {
    from: "/handout/BIO505T/midterm",
    to: "/courses",
  },
  {
    from: "/handout/BIO734/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/BT101/midterm",
    to: "/courses",
  },
  {
    from: "/handout/BT401/midterm",
    to: "/courses",
  },
  {
    from: "/handout/BT404/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/BT405/midterm",
    to: "/courses",
  },
  {
    from: "/handout/BT503/midterm",
    to: "/courses",
  },
  {
    from: "/handout/BT603/midterm",
    to: "/courses",
  },
  {
    from: "/handout/BT605/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/CHE301/midterm",
    to: "/courses",
  },
  {
    from: "/handout/CS310/midterm",
    to: "/courses",
  },
  {
    from: "/handout/CS311/midterm",
    to: "/courses",
  },
  {
    from: "/handout/CS401/midterm",
    to: "/past-papers/CS401/midterm",
  },
  {
    from: "/handout/CS507/finalterm",
    to: "/past-papers/CS507/finalterm",
  },
  {
    from: "/handout/CS607/finalterm",
    to: "/past-papers/CS607/finalterm",
  },
  {
    from: "/handout/CS615/finalterm",
    to: "/past-papers/CS615/finalterm",
  },
  {
    from: "/handout/CS625/midterm",
    to: "/courses",
  },
  {
    from: "/handout/CS707/midterm",
    to: "/courses",
  },
  {
    from: "/handout/ECO501/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/ENG401/midterm",
    to: "/courses",
  },
  {
    from: "/handout/ENG506/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/ENG510/finalterm",
    to: "/past-papers/ENG510/midterm",
  },
  {
    from: "/handout/ENG523/midterm",
    to: "/past-papers/ENG523/finalterm",
  },
  {
    from: "/handout/ETH202/midterm",
    to: "/courses",
  },
  {
    from: "/handout/MCM301/finalterm",
    to: "/past-papers/MCM301/midterm",
  },
  {
    from: "/handout/MCM304/finalterm",
    to: "/past-papers/MCM304/midterm",
  },
  {
    from: "/handout/MCM431/midterm",
    to: "/courses",
  },
  {
    from: "/handout/MCM601/midterm",
    to: "/courses",
  },
  {
    from: "/handout/MGT201/finalterm",
    to: "/past-papers/MGT201/midterm",
  },
  {
    from: "/handout/MGT301/finalterm",
    to: "/past-papers/MGT301/finalterm",
  },
  {
    from: "/handout/MGT510/midterm",
    to: "/courses",
  },
  {
    from: "/handout/MKT625/midterm",
    to: "/courses",
  },
  {
    from: "/handout/MTH403/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/MTH405/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/MTH405/midterm",
    to: "/courses",
  },
  {
    from: "/handout/MTH641/midterm",
    to: "/courses",
  },
  {
    from: "/handout/MTH645/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/MTH647/finalterm",
    to: "/courses",
  },
  {
    from: "/handout/PSY515/midterm",
    to: "/courses",
  },
  {
    from: "/handout/ZOO101/midterm",
    to: "/past-papers/ZOO101/midterm",
  },
  {
    from: "/handout/ZOO403/midterm",
    to: "/courses",
  },
  {
    from: "/handout/ZOO505/midterm",
    to: "/courses",
  },
];
