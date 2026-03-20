import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';

import ws from 'ws';
neonConfig.webSocketConstructor = ws;


// to work in edge environments (cloudflare workers, vercel edge, etc.), enable querying over fetch
// neonConfig.poolQueryViaFetch = true

// type definitions
// declare global{
// var prisma : PrismaClient | undefined
// }

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaNeon({ connectionString });
const prisma = global.prisma || new PrismaClient({adapter});

if(process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
