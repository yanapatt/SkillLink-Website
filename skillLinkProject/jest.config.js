module.exports = {
    transform: {
        '^.+\\.[t|j]sx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!(chai)/)', // ให้ Jest แปลง chai หรือโมดูลอื่นๆ ที่ต้องการ
    ],
};
