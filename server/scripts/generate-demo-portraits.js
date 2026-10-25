/**
 * Skillzy Demo Portrait Generator Workflow
 * 
 * Contains the complete, reproducible image-generation workflow and prompts
 * for all 45 Skillzy Indian demo users.
 * 
 * Generated portraits are saved to client/public/images/demo-users/
 * 
 * Usage:
 *   node scripts/generate-demo-portraits.js --all
 *   node scripts/generate-demo-portraits.js --user=pragya-tiwari
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', '..', 'client', 'public', 'images', 'demo-users');

const DEMO_PORTRAIT_SPECIFICATIONS = [
  // --- 25 NEW FICTIONAL INDIAN PROFILES ---
  {
    slug: 'dev-malhotra',
    name: 'Dev Malhotra',
    status: 'GENERATED_AI_PHOTO',
    file: 'dev-malhotra.jpg',
    prompt: 'Realistic, high quality headshot portrait photograph of a young Indian male college student in his early 20s named Dev Malhotra from Delhi. Warm friendly smile, neat black hair, casual modern navy blue t-shirt, natural soft indoor lighting, neutral blurred background. Square aspect ratio, sharp focus, photographic style, no text, no watermarks.'
  },
  {
    slug: 'aditi-kulkarni',
    name: 'Aditi Kulkarni',
    status: 'GENERATED_AI_PHOTO',
    file: 'aditi-kulkarni.jpg',
    prompt: 'Realistic, high quality headshot portrait photograph of Aditi Kulkarni, a 22-year-old Indian woman and UI/UX design student from Pune. Expressive eyes, stylish shoulder-length wavy dark hair, elegant mustard-yellow casual top, in a brightly lit modern design studio with soft bokeh. Natural soft daylight, warm smile, sharp photographic portrait, square aspect ratio, no watermarks.'
  },
  {
    slug: 'kabir-khan',
    name: 'Kabir Khan',
    status: 'GENERATED_AI_PHOTO',
    file: 'kabir-khan.jpg',
    prompt: 'Realistic, high quality headshot portrait photograph of Kabir Khan, a 24-year-old Indian man in AI and Robotics from Hyderabad. Short textured black hair, neat light stubble, confident friendly expression, charcoal grey crew-neck sweater, in a modern tech lab / collaborative workspace with soft ambient lighting. Square aspect ratio, sharp focus photograph.'
  },
  {
    slug: 'riya-chatterjee',
    name: 'Riya Chatterjee',
    status: 'GENERATED_AI_PHOTO',
    file: 'riya-chatterjee.jpg',
    prompt: 'Realistic, high quality headshot portrait photograph of Riya Chatterjee, a 21-year-old Indian woman from Kolkata studying psychology and communications. Long dark hair, gentle smiling expression, subtle teal collared cotton kurta, in a sunlit academic library with bookshelves softly blurred in the background. Natural realistic lighting, square aspect ratio.'
  },
  {
    slug: 'manav-joshi',
    name: 'Manav Joshi',
    status: 'GENERATED_AI_PHOTO',
    file: 'manav-joshi.jpg',
    prompt: 'Realistic, high quality headshot portrait photograph of Manav Joshi, a 22-year-old Indian male game developer from Ahmedabad. Modern black-rimmed glasses, casual olive green hoodie, enthusiastic friendly smile, seated near a dual-monitor creative workstation with soft purple/blue desk ambient glow. Authentic skin texture, square aspect ratio, sharp focus.'
  },
  {
    slug: 'zara-sheikh',
    name: 'Zara Sheikh',
    status: 'GENERATED_AI_PHOTO',
    file: 'zara-sheikh.jpg',
    prompt: 'Realistic, high quality headshot portrait photograph of Zara Sheikh, a 23-year-old Indian woman and creative content writer from Lucknow. Warm brown eyes, graceful smile, pastel maroon linen shirt, outdoors in a peaceful courtyard cafe with natural morning sunlight and green foliage bokeh. Sharp photographic portrait, square aspect ratio.'
  },
  {
    slug: 'yash-thakur',
    name: 'Yash Thakur',
    status: 'GENERATED_AI_PHOTO',
    file: 'yash-thakur.jpg',
    prompt: 'Realistic, high quality headshot portrait photograph of Yash Thakur, a 22-year-old athletic Indian male student leader and sports enthusiast from Chandigarh. Clean-shaven, energetic confident smile, athletic build, sporty maroon track jacket, standing outdoors on a bright university campus with trees in the background. Natural daylight, square aspect ratio.'
  },
  {
    slug: 'simran-kaur',
    name: 'Simran Kaur',
    status: 'GENERATED_AI_PHOTO',
    file: 'simran-kaur.jpg',
    prompt: 'Realistic, high quality headshot portrait photograph of Simran Kaur, a 23-year-old Indian woman from Amritsar who studies law and public speaking. Sharp thoughtful features, hair neatly tied back, crisp formal white collared shirt with a grey blazer, in an academic conference room setting with warm soft lighting. Confident articulate smile, square aspect ratio.'
  },
  {
    slug: 'siddharth-jain',
    name: 'Siddharth Jain',
    status: 'GENERATED_AI_PHOTO',
    file: 'siddharth-jain.jpg',
    prompt: 'Realistic, high quality headshot portrait photograph of Siddharth Jain, a 26-year-old Indian product manager and startup enthusiast from Bengaluru. Neatly groomed short beard, modern smart-casual chambray button-down shirt, friendly professional smile, standing in a contemporary startup open office with soft architectural lighting in the background.'
  },
  {
    slug: 'diya-kapoor',
    name: 'Diya Kapoor',
    status: 'GENERATED_AI_PHOTO',
    file: 'diya-kapoor.jpg',
    prompt: 'Realistic, high quality headshot portrait photograph of Diya Kapoor, a 22-year-old Indian woman and data science researcher from Delhi. Elegant round wire-frame glasses, dark hair in a casual ponytail, soft lavender sweater, in a modern university computer lab with natural window lighting from the side. Intelligent warm smile, square aspect ratio.'
  },
  {
    slug: 'rudra-pratap-singh',
    name: 'Rudra Pratap Singh',
    status: 'GENERATED_AI_PHOTO',
    file: 'rudra-pratap-singh.jpg',
    prompt: 'Realistic, high quality headshot portrait photograph of Rudra Pratap Singh, a 24-year-old Indian male travel photographer from Jaipur. Stylish trim beard, warm sun-kissed complexion, rugged beige denim overshirt with a camera strap across his shoulder, outdoors in front of historic terracotta stone architecture with golden hour light. Square aspect ratio.'
  },
  {
    slug: 'pragya-tiwari',
    name: 'Pragya Tiwari',
    status: 'PENDING_QUOTA_RESET',
    file: 'pragya-tiwari.svg',
    prompt: 'Realistic, high quality headshot portrait photograph of Pragya Tiwari, a 24-year-old Indian woman and yoga/wellness practitioner from Rishikesh. Serene, radiant gentle smile, natural hair, earthy pastel green organic cotton top, in a tranquil sunlit indoor wellness studio with bamboo plants in the background. Soft diffused natural light, square aspect ratio.'
  },
  {
    slug: 'harsh-vardhan',
    name: 'Harsh Vardhan',
    status: 'PENDING_QUOTA_RESET',
    file: 'harsh-vardhan.svg',
    prompt: 'Realistic, high quality headshot portrait photograph of Harsh Vardhan, a 25-year-old Indian male finance analyst and fintech entrepreneur from Mumbai. Clean professional appearance, short groomed hair, crisp light blue formal shirt, confident approachable smile, with Mumbai skyline visible through high-rise office windows softly blurred behind him. Square aspect ratio.'
  },
  {
    slug: 'tanya-bose',
    name: 'Tanya Bose',
    status: 'GENERATED_AI_PHOTO',
    file: 'tanya-bose.jpg',
    prompt: 'Realistic, high quality headshot portrait photograph of Tanya Bose, a 22-year-old Indian woman and IoT/hardware engineer from Kolkata. Shoulder-length dark hair, teal round-neck top, warm curious smile, in a makerspace workshop with electronics breadboards and soldering gear softly blurred in the background. Natural indoor lighting, square aspect ratio.'
  },
  {
    slug: 'reyansh-mittal',
    name: 'Reyansh Mittal',
    status: 'GENERATED_AI_PHOTO',
    file: 'reyansh-mittal.jpg',
    prompt: 'Realistic, high quality headshot portrait photograph of Reyansh Mittal, a 24-year-old Indian male cloud engineer from Noida. Stylish styled hair, light stubble, modern dark grey polo shirt, friendly approachable expression, in a high-tech modern data center or cloud office environment. Sharp focus photographic portrait, square aspect ratio.'
  },
  {
    slug: 'meera-deshpande',
    name: 'Meera Deshpande',
    status: 'PENDING_QUOTA_RESET',
    file: 'meera-deshpande.svg',
    prompt: 'Realistic, high quality headshot portrait photograph of Meera Deshpande, a 21-year-old Indian woman and vocalist from Pune. Expressive eyes, small traditional bindi, dark hair gracefully draped, tasteful indigo handloom kurta, in an acoustic music room with wooden acoustics in the background. Warm artistic portrait, natural lighting, square aspect ratio.'
  },
  {
    slug: 'nikhil-yadav',
    name: 'Nikhil Yadav',
    status: 'PENDING_QUOTA_RESET',
    file: 'nikhil-yadav.svg',
    prompt: 'Realistic, high quality headshot portrait photograph of Nikhil Yadav, a 22-year-old athletic Indian male basketball player and fitness enthusiast from Gurugram. Joyful energetic smile, athletic physique, dry-fit black athletic t-shirt, standing beside an outdoor sports court in crisp morning sunlight. Realistic skin texture, square aspect ratio.'
  },
  {
    slug: 'pooja-agarwal',
    name: 'Pooja Agarwal',
    status: 'PENDING_QUOTA_RESET',
    file: 'pooja-agarwal.svg',
    prompt: 'Realistic, high quality headshot portrait photograph of Pooja Agarwal, a 25-year-old Indian woman and machine learning researcher from Bengaluru. Intelligent focused eyes, hair tied back, plum-colored knit top, standing in a university research lounge with large glass windows and indoor greenery. Warm confident smile, realistic photographic headshot, square aspect ratio.'
  },
  {
    slug: 'arjun-reddy',
    name: 'Arjun Reddy',
    status: 'PENDING_QUOTA_RESET',
    file: 'arjun-reddy.svg',
    prompt: 'Realistic, high quality headshot portrait photograph of Arjun Reddy, a 24-year-old Indian male cybersecurity analyst from Hyderabad. Contemporary dark spectacles, neat short beard, charcoal black tech jacket, in a modern cyber operations security hub with sleek subtle server rack lights. Calm intelligent expression, square aspect ratio.'
  },
  {
    slug: 'sanika-deshmukh',
    name: 'Sanika Deshmukh',
    status: 'PENDING_QUOTA_RESET',
    file: 'sanika-deshmukh.svg',
    prompt: 'Realistic, high quality headshot portrait photograph of Sanika Deshmukh, a 21-year-old Indian woman fashion designer from Mumbai. Chic bob hairstyle, modern fuchsia asymmetrical top, warm smile, standing in a sunlit fashion studio with fabric swatches and mannequins softly blurred in the background. Square aspect ratio.'
  },
  {
    slug: 'karan-malhotra',
    name: 'Karan Malhotra',
    status: 'PENDING_QUOTA_RESET',
    file: 'karan-malhotra.svg',
    prompt: 'Realistic, high quality headshot portrait photograph of Karan Malhotra, a 22-year-old Indian video editor from Mumbai. Over-ear studio headphones resting around neck, emerald green hoodie, creative enthusiastic expression, seated in a dark editing suite with timeline color grading monitors in background. Square aspect ratio.'
  },
  {
    slug: 'neha-saxena',
    name: 'Neha Saxena',
    status: 'PENDING_QUOTA_RESET',
    file: 'neha-saxena.svg',
    prompt: 'Realistic, high quality headshot portrait photograph of Neha Saxena, a 24-year-old Indian female entrepreneur and E-cell lead from Indore. Sharp layered hairstyle, warm terracotta formal blazer, confident inspiring smile, standing in a bright campus innovation center with glass whiteboards in background. Square aspect ratio.'
  },
  {
    slug: 'vishal-sinha',
    name: 'Vishal Sinha',
    status: 'PENDING_QUOTA_RESET',
    file: 'vishal-sinha.svg',
    prompt: 'Realistic, high quality headshot portrait photograph of Vishal Sinha, a 23-year-old Indian mobile app developer from Patna. Short neat haircut, light blue polo t-shirt, holding a smartphone casually, friendly approachable smile, in a modern co-working space lounge with indoor plants. Square aspect ratio.'
  },
  {
    slug: 'ishita-mukherjee',
    name: 'Ishita Mukherjee',
    status: 'PENDING_QUOTA_RESET',
    file: 'ishita-mukherjee.svg',
    prompt: 'Realistic, high quality headshot portrait photograph of Ishita Mukherjee, a 22-year-old Indian classical vocalist from Kolkata. Traditional red bindi, graceful long black hair, elegant deep crimson silk kurta, seated with a tanpura in the background with warm amber hall lighting. Square aspect ratio.'
  },
  {
    slug: 'farhan-qureshi',
    name: 'Farhan Qureshi',
    status: 'PENDING_QUOTA_RESET',
    file: 'farhan-qureshi.svg',
    prompt: 'Realistic, high quality headshot portrait photograph of Farhan Qureshi, a 24-year-old Indian social impact organizer from Bhopal. Friendly warm brown eyes, short curly hair, trimmed beard, forest green linen shirt, outdoors in front of a community center courtyard with soft natural afternoon light. Square aspect ratio.'
  },

  // --- 20 EXISTING DEMO PROFILES ---
  { slug: 'aarav-sharma', name: 'Aarav Sharma', status: 'PENDING_QUOTA_RESET', file: 'aarav-sharma.svg', prompt: 'Realistic headshot portrait of Aarav Sharma, 23-year-old Indian male web developer from Delhi, dark crew-neck tee, natural library lighting, square aspect ratio.' },
  { slug: 'priya-nair', name: 'Priya Nair', status: 'PENDING_QUOTA_RESET', file: 'priya-nair.svg', prompt: 'Realistic headshot portrait of Priya Nair, 22-year-old Indian woman UI/UX designer from Kochi, plum linen top, sunlit cafe background, square aspect ratio.' },
  { slug: 'rohan-verma', name: 'Rohan Verma', status: 'PENDING_QUOTA_RESET', file: 'rohan-verma.svg', prompt: 'Realistic headshot portrait of Rohan Verma, 24-year-old Indian Python developer from Lucknow, spectacles, blue casual tee, study room, square aspect ratio.' },
  { slug: 'ananya-iyer', name: 'Ananya Iyer', status: 'PENDING_QUOTA_RESET', file: 'ananya-iyer.svg', prompt: 'Realistic headshot portrait of Ananya Iyer, 23-year-old Indian data analyst from Chennai, neat hair bun, mauve kurta, college courtyard, square aspect ratio.' },
  { slug: 'vikram-singh', name: 'Vikram Singh', status: 'PENDING_QUOTA_RESET', file: 'vikram-singh.svg', prompt: 'Realistic headshot portrait of Vikram Singh, 25-year-old Indian Java backend developer from Jaipur, trimmed beard, amber button-down shirt, square aspect ratio.' },
  { slug: 'meera-krishnan', name: 'Meera Krishnan', status: 'PENDING_QUOTA_RESET', file: 'meera-krishnan.svg', prompt: 'Realistic headshot portrait of Meera Krishnan, 22-year-old Indian frontend developer from Bengaluru, pink cotton top, tech park background, square aspect ratio.' },
  { slug: 'aditya-patel', name: 'Aditya Patel', status: 'PENDING_QUOTA_RESET', file: 'aditya-patel.svg', prompt: 'Realistic headshot portrait of Aditya Patel, 23-year-old Indian DevOps engineer from Ahmedabad, emerald polo, campus setting, square aspect ratio.' },
  { slug: 'sneha-reddy', name: 'Sneha Reddy', status: 'PENDING_QUOTA_RESET', file: 'sneha-reddy.svg', prompt: 'Realistic headshot portrait of Sneha Reddy, 24-year-old Indian ML engineer from Hyderabad, purple blazer, modern office, square aspect ratio.' },
  { slug: 'arjun-das', name: 'Arjun Das', status: 'PENDING_QUOTA_RESET', file: 'arjun-das.svg', prompt: 'Realistic headshot portrait of Arjun Das, 22-year-old Indian systems programmer from Kolkata, indigo hoodie, university computer lab, square aspect ratio.' },
  { slug: 'kavya-menon', name: 'Kavya Menon', status: 'PENDING_QUOTA_RESET', file: 'kavya-menon.svg', prompt: 'Realistic headshot portrait of Kavya Menon, 21-year-old Indian content strategist from Thiruvananthapuram, purple kurti, library background, square aspect ratio.' },
  { slug: 'rahul-choudhary', name: 'Rahul Choudhary', status: 'PENDING_QUOTA_RESET', file: 'rahul-choudhary.svg', prompt: 'Realistic headshot portrait of Rahul Choudhary, 24-year-old Indian cloud developer from Pune, teal crew-neck, sunny campus, square aspect ratio.' },
  { slug: 'ishita-banerjee', name: 'Ishita Banerjee', status: 'PENDING_QUOTA_RESET', file: 'ishita-banerjee.svg', prompt: 'Realistic headshot portrait of Ishita Banerjee, 23-year-old Indian creative editor from Mumbai, red bindi, linen shirt, studio background, square aspect ratio.' },
  { slug: 'karthik-subramanian', name: 'Karthik Subramanian', status: 'PENDING_QUOTA_RESET', file: 'karthik-subramanian.svg', prompt: 'Realistic headshot portrait of Karthik Subramanian, 25-year-old Indian data scientist from Coimbatore, wire-frame glasses, formal blue shirt, square aspect ratio.' },
  { slug: 'neha-gupta', name: 'Neha Gupta', status: 'PENDING_QUOTA_RESET', file: 'neha-gupta.svg', prompt: 'Realistic headshot portrait of Neha Gupta, 22-year-old Indian graphic designer from Bhopal, magenta casual kurta, creative workshop, square aspect ratio.' },
  { slug: 'sandeep-kumar', name: 'Sandeep Kumar', status: 'PENDING_QUOTA_RESET', file: 'sandeep-kumar.svg', prompt: 'Realistic headshot portrait of Sandeep Kumar, 23-year-old Indian competitive programmer from Patna, mustard athletic tee, college quad, square aspect ratio.' },
  { slug: 'divya-joshi', name: 'Divya Joshi', status: 'PENDING_QUOTA_RESET', file: 'divya-joshi.svg', prompt: 'Realistic headshot portrait of Divya Joshi, 24-year-old Indian environmental researcher from Dehradun, sage green top, mountain valley background, square aspect ratio.' },
  { slug: 'nikhil-rao', name: 'Nikhil Rao', status: 'PENDING_QUOTA_RESET', file: 'nikhil-rao.svg', prompt: 'Realistic headshot portrait of Nikhil Rao, 23-year-old Indian cybersecurity analyst from Visakhapatnam, cyan polo, tech hub background, square aspect ratio.' },
  { slug: 'pooja-shah', name: 'Pooja Shah', status: 'PENDING_QUOTA_RESET', file: 'pooja-shah.svg', prompt: 'Realistic headshot portrait of Pooja Shah, 24-year-old Indian product designer from Surat, stylish glasses, lavender knit, design studio, square aspect ratio.' },
  { slug: 'farhan-ahmed', name: 'Farhan Ahmed', status: 'PENDING_QUOTA_RESET', file: 'farhan-ahmed.svg', prompt: 'Realistic headshot portrait of Farhan Ahmed, 25-year-old Indian full-stack developer from Srinagar, indigo jacket, modern workspace, square aspect ratio.' },
  { slug: 'lakshmi-prasad', name: 'Lakshmi Prasad', status: 'PENDING_QUOTA_RESET', file: 'lakshmi-prasad.svg', prompt: 'Realistic headshot portrait of Lakshmi Prasad, 23-year-old Indian database engineer from Bhubaneswar, green cotton kurta, university library, square aspect ratio.' }
];

console.log('=== SKILLZY DEMO PORTRAIT SPECIFICATIONS CATALOGUE ===');
console.log(`Total Profiles: ${DEMO_PORTRAIT_SPECIFICATIONS.length}`);
const aiGenerated = DEMO_PORTRAIT_SPECIFICATIONS.filter(p => p.status === 'GENERATED_AI_PHOTO');
const vectorFallback = DEMO_PORTRAIT_SPECIFICATIONS.filter(p => p.status !== 'GENERATED_AI_PHOTO');

console.log(`- AI-Generated Photographs (completed): ${aiGenerated.length}`);
console.log(`- Custom Vector Portraits (active fallbacks): ${vectorFallback.length}`);

module.exports = {
  OUTPUT_DIR,
  DEMO_PORTRAIT_SPECIFICATIONS
};
