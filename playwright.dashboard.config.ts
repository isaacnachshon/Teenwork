import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/dashboard',testMatch:'*.spec.ts',workers:1,use:{baseURL:'http://127.0.0.1:4174'},webServer:{command:'node tests/dashboard/server.mjs',url:'http://127.0.0.1:4174',reuseExistingServer:false}});
