export const categories = {
  food: {
    label: "Food",
    keywords: ["food", "meal", "meals", "hungry", "groceries", "grocery", "snap", "ebt", "pantry"]
  },
  rent: {
    label: "Rent",
    keywords: ["rent", "eviction", "housing", "utility", "utilities", "deposit", "landlord", "shelter", "homeless"]
  },
  jobs: {
    label: "Jobs",
    keywords: ["job", "jobs", "work", "career", "resume", "interview", "training", "employment"]
  },
  healthcare: {
    label: "Healthcare",
    keywords: ["doctor", "clinic", "medical", "healthcare", "health", "dental", "medicine", "insurance", "hospital", "er"]
  },
  mental_health: {
    label: "Mental Health",
    keywords: ["mental", "therapy", "counseling", "depressed", "anxiety", "suicide", "crisis", "addiction", "unsafe", "danger", "violence", "abuse"]
  },
  legal: {
    label: "Legal Aid",
    keywords: ["legal", "lawyer", "attorney", "immigration", "benefits", "tenant", "court", "rights"]
  },
  education: {
    label: "Education",
    keywords: ["school", "education", "classes", "ged", "college", "tutoring", "english", "esl"]
  }
};

export const resources = [
  {
    id: "solid-ground-food",
    name: "Solid Ground Food Resources",
    categories: ["food", "rent"],
    location: "Seattle",
    description: "Connects Seattle residents with food access, housing stability, tenant help, and benefits navigation.",
    eligibility: "Seattle and King County residents; program eligibility varies by income and household situation.",
    website: "https://www.solid-ground.org",
    phone: "206-694-6700",
    documents: ["Photo ID if available", "Proof of address", "Income or benefits information"],
    nextAction: "Call the main line and ask for food access or housing stability intake."
  },
  {
    id: "hopelink-food-rent",
    name: "Hopelink Bellevue Service Center",
    categories: ["food", "rent", "jobs", "education"],
    location: "Bellevue",
    description: "Provides food markets, emergency financial help, transportation support, adult education, and employment help.",
    eligibility: "Primarily serves low-income residents in north and east King County, including Bellevue.",
    website: "https://www.hopelink.org",
    phone: "425-943-7555",
    documents: ["Photo ID", "Proof of Bellevue or east King County residence", "Lease or utility bill for financial help"],
    nextAction: "Contact the Bellevue center to schedule an appointment or ask about food market hours."
  },
  {
    id: "byrds-barr-place",
    name: "Byrd Barr Place",
    categories: ["food", "rent", "legal"],
    location: "Seattle",
    description: "Offers a food bank, energy assistance, housing stability referrals, and community support services.",
    eligibility: "Seattle-area households; some programs require income qualification.",
    website: "https://byrdbarrplace.org",
    phone: "206-812-4940",
    documents: ["Photo ID", "Proof of address", "Utility bill when requesting energy assistance"],
    nextAction: "Check food bank hours online or call to ask about emergency assistance screening."
  },
  {
    id: "king-county-211",
    name: "King County 211",
    categories: ["food", "rent", "healthcare", "mental_health", "legal", "education", "jobs"],
    location: "King County",
    urgent: true,
    description: "A navigation line that connects people to local shelter, food, rent assistance, healthcare, legal aid, and crisis resources.",
    eligibility: "Open to King County residents and people seeking services in the area.",
    website: "https://wa211.org",
    phone: "2-1-1",
    documents: ["Describe your need", "ZIP code or neighborhood", "Any deadlines or urgent safety concerns"],
    nextAction: "Call 2-1-1 and share your location, deadline, and the type of help needed."
  },
  {
    id: "marys-place",
    name: "Mary's Place Family Shelter",
    categories: ["rent", "food"],
    location: "Seattle",
    urgent: true,
    description: "Emergency shelter and support for families experiencing homelessness in King County.",
    eligibility: "Families with children experiencing homelessness or housing crisis.",
    website: "https://www.marysplaceseattle.org",
    phone: "206-245-1026",
    documents: ["Names and ages of family members", "Current location", "Any safety or medical needs"],
    nextAction: "Call the shelter line as early as possible and ask about current family shelter availability."
  },
  {
    id: "crisis-connections",
    name: "Crisis Connections",
    categories: ["mental_health"],
    location: "King County",
    urgent: true,
    description: "24/7 crisis support, emotional support, and referrals for people in distress.",
    eligibility: "Anyone in emotional distress or concerned about someone else.",
    website: "https://www.crisisconnections.org",
    phone: "866-427-4747",
    documents: ["No documents required", "Share immediate safety concerns", "Share your current location if in danger"],
    nextAction: "Call now for crisis support. If there is immediate danger, call 911."
  },
  {
    id: "seattle-indian-health-board",
    name: "Seattle Indian Health Board",
    categories: ["healthcare", "mental_health"],
    location: "Seattle",
    description: "Culturally attuned medical, dental, behavioral health, and community wellness services.",
    eligibility: "Open to all, with a focus on Native people and urban Indian communities.",
    website: "https://www.sihb.org",
    phone: "206-324-9360",
    documents: ["Photo ID", "Insurance card if insured", "Medication list"],
    nextAction: "Call registration to ask about new patient appointments and behavioral health availability."
  },
  {
    id: "healthpoint-bellevue",
    name: "HealthPoint Bellevue",
    categories: ["healthcare", "mental_health"],
    location: "Bellevue",
    description: "Community health center offering medical, dental, behavioral health, pharmacy, and insurance enrollment support.",
    eligibility: "All ages; accepts Medicaid, Medicare, private insurance, and offers a sliding fee discount.",
    website: "https://www.healthpointchc.org",
    phone: "425-882-1697",
    documents: ["Photo ID", "Insurance card if any", "Proof of income for sliding fee discount"],
    nextAction: "Call to schedule a new patient visit or ask for same-week appointment options."
  },
  {
    id: "worksource-seattle-king-county",
    name: "WorkSource Seattle-King County",
    categories: ["jobs", "education"],
    location: "Seattle",
    description: "Free employment services including job search help, resume support, workshops, and training referrals.",
    eligibility: "Open to job seekers and workers in King County.",
    website: "https://www.worksourceskc.org",
    phone: "206-477-7000",
    documents: ["Resume if available", "Work history", "ID for some services"],
    nextAction: "Create or update your WorkSource profile and register for a job search workshop."
  },
  {
    id: "bellevue-college-continuing-ed",
    name: "Bellevue College Continuing Education",
    categories: ["education", "jobs"],
    location: "Bellevue",
    description: "Career training, adult learning, professional certificates, and skill-building classes.",
    eligibility: "Open enrollment for many classes; scholarship or workforce funding may have separate requirements.",
    website: "https://www.bellevuecollege.edu/ce",
    phone: "425-564-2263",
    documents: ["Program interest", "Prior transcripts if requested", "Funding or employer paperwork if applicable"],
    nextAction: "Browse current certificate programs and ask advising about funding options."
  },
  {
    id: "nw-justice-project",
    name: "Northwest Justice Project CLEAR",
    categories: ["legal", "rent"],
    location: "Washington",
    description: "Free civil legal help for low-income people, including housing, benefits, family safety, and consumer issues.",
    eligibility: "Low-income Washington residents with qualifying civil legal issues.",
    website: "https://nwjustice.org",
    phone: "888-201-1014",
    documents: ["Court papers or notices", "Lease or letters from landlord", "Benefits notices or relevant records"],
    nextAction: "Call CLEAR and describe your legal deadline, notices received, and household income."
  },
  {
    id: "el-centro",
    name: "El Centro de la Raza",
    categories: ["food", "rent", "education", "legal"],
    location: "Seattle",
    description: "Multiservice community organization with food, housing navigation, education, legal clinics, and family support.",
    eligibility: "Seattle and King County residents; some programs prioritize Latino communities or income-qualified households.",
    website: "https://www.elcentrodelaraza.org",
    phone: "206-957-4605",
    documents: ["Photo ID", "Proof of address", "Program-specific income or household documents"],
    nextAction: "Call the main office and ask which intake is right for your need."
  }
];
