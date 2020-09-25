module.exports = {
    apps: [
        {
            name: 'truyenbt-server:dev',
            script: 'npm run start:dev',
            // watch: ['src'],
            env: {
                NODE_ENV: 'development',
            },
        },
    ],
};
