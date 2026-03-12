import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve('C:\\LukessHome\\lukess-inventory-system\\.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function test() {
    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('id, notify_email')
        .eq('id', '6493b82f-c4ea-4d02-848f-14091bc53537')
        .single()

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Data:', data)
        console.log('typeof notify_email:', typeof data.notify_email)
        console.log('if (data.notify_email):', data.notify_email ? 'truthy' : 'falsy')
    }
}

test()
