const required = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};

const optional = (key, defaultValue = '') => process.env[key] ?? defaultValue;

export const config = {
    server: {
        port: parseInt(optional('PORT', '3000'), 10),
        nodeEnv: optional('NODE_ENV', 'development'),
    },
    db: {
        host:     required('DB_HOST'),
        user:     required('DB_USER'),
        password: required('DB_PASSWORD'),
        name:     required('DB_NAME'),
    },
    jwt: {
        secret:    optional('JWT_SECRET', 'change_this_secret_in_production'),
        expiresIn: optional('JWT_EXPIRES_IN', '7d'),
    },
};

export const validateConfig = () => {
    try {
        required('DB_HOST');
        required('DB_USER');
        required('DB_PASSWORD');
        required('DB_NAME');
        console.log('✅ Configuration validated successfully');
    } catch (error) {
        console.error('❌ Configuration error:', error.message);
        process.exit(1);
    }
};