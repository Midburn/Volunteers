module.exports = {
    entry: './src/components/VolunteerList.js',
    output: {
        filename: 'bundle.js',
        path: 'public'
    },
    module: {
        loaders: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015']
                }
            }
        ]
    }
};