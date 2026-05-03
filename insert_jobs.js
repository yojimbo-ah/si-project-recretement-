const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Lire .env.local manuellement
const envFile = fs.readFileSync('.env.local', 'utf8')
const envVars = {}
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) envVars[key.trim()] = value.trim().replace(/^['"]|['"]$/g, '')
})

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL']
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']

const supabase = createClient(supabaseUrl, supabaseKey)

async function insertJobs() {
  const newJobs = [
    { title: 'Digital Marketing Specialist', company: 'Yassir', location: '16-Alger', type: 'On-site', salary: '90k - 130k DA', description: 'Join our growth team to lead digital campaigns.' },
    { title: 'DevOps Engineer', company: 'Sonatrach', location: '30-Ouargla', type: 'On-site', salary: '180k - 240k DA', description: 'Manage cloud infrastructure and CI/CD pipelines.' },
    { title: 'Financial Analyst', company: 'Société Générale Algérie', location: '16-Alger', type: 'Hybrid', salary: '110k - 160k DA', description: 'Analyze market trends and financial reports.' },
    { title: 'Project Manager', company: 'Condor Electronics', location: '34-Bordj Bou Arreridj', type: 'On-site', salary: '130k - 180k DA', description: 'Coordinate industrial projects and teams.' },
    { title: 'Sales Executive', company: 'Ooredoo', location: '31-Oran', type: 'Hybrid', salary: '80k - 120k DA', description: 'Drive sales growth in the western region.' },
    { title: 'Content Creator', company: 'Talent-DZ', location: 'Remote', type: 'Remote', salary: '60k - 90k DA', description: 'Create engaging content for our professional community.' }
  ]

  console.log('Inserting 6 new jobs...')
  const { data, error } = await supabase.from('job_offers').insert(newJobs)
  
  if (error) {
    console.error('Error inserting jobs:', error)
  } else {
    console.log('Successfully inserted 6 jobs!')
  }
}

insertJobs()
