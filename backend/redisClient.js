// redisClient.js
import { createClient } from 'redis';

const client = createClient({
  url: 'redis://default:RrFYGbCewuzrR5523eA9ELEAL7VGBLW1@redis-15099.c11.us-east-1-3.ec2.redns.redis-cloud.com:15099'
});

client.on('error', (err) => console.error('Redis Client Error', err));

await client.connect();

export default client;
