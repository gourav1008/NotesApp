import {Ratelimit} from '@upstash/ratelimit';
import {Redis} from '@upstash/redis';
import dotenv from 'dotenv'

dotenv.config();

// create a ratlimiter that allows 10 requests per 20 sec

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(25, "100 s"),
});

export default ratelimit;
