const path = require('path')
const fs = require('fs')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')

module.exports = (env, argv) => ({
    mode: 'development',
    context: path.resolve(__dirname, 'src'),

    resolveLoader: {
        modules: ['node_modules', path.resolve(__dirname, 'webpack-additional')]
    },

    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
                path.resolve(__dirname, 'dist')
            ]
        }),
        ...addDevServer(argv),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src', 'fonts'),
                    to: path.resolve(__dirname, 'dist', 'fonts'),
                    noErrorOnMissing: true,
                },
                {
                    from: path.resolve(__dirname, 'src', 'img'),
                    to: path.resolve(__dirname, 'dist', 'img'),
                    noErrorOnMissing: true,
                },
                {
                    from: path.resolve(__dirname, 'src', 'favicon.ico'),
                    to: path.resolve(__dirname, 'dist', 'favicon.ico'),
                    noErrorOnMissing: true,
                },
            ],
        }),
        new MiniCssExtractPlugin({
            filename: './css/[name].bundle.css',
        })
    ].concat(getPagesHtmlFiles()),

    devServer: {
        historyApiFallback: true,
        static: path.resolve(__dirname, 'dist'),
        open: true,
        compress: true,
        liveReload: true,
        hot: false,
    },

    module: {
        rules: [
            {
                test: /\.pug$/,
                use: ['pug-loader'],
                exclude: path.resolve(__dirname, 'src', 'pug', 'pages'),
            },
            {
                test: /\.pug$/,
                use: [
                    'pug-loader',
                    {
                        loader: 'append-loader',
                        options: {
                            append: 'extends ../app \n\n'
                        }
                    }
                ],
                include: path.resolve(__dirname, 'src', 'pug', 'pages'),
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            additionalData: "@import '../app';"
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                exclude: [
                    path.resolve(__dirname, 'src', 'js', 'pages'),
                    path.resolve(__dirname, 'node_modules'),
                ],
                loader: 'babel-loader',
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src', 'js', 'pages'),
                use: [
                    'babel-loader',
                    {
                        loader: 'append-loader',
                        options: {
                            append: 'import "../app.js"\n'
                        }
                    }
                ]
            }
        ]
    },

    entry: {
        app: './js/app.js',
        ...getPagesFiles(),
    },

    output: {
        filename: './js/[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    target: "web",
})

function getPagesFiles() {
    const filesObj = {}

    fs.readdirSync('./src/js/pages').forEach(file => {
        const filename = file.replace('.js', '')

        if(!filesObj[filename]) {
            filesObj[filename] = []
        }

        filesObj[filename].push(`./js/pages/${file}`)
    })

    fs.readdirSync('./src/scss/pages').forEach(file => {
        const filename = file.replace('.scss', '')

        if(!filesObj[filename]) {
            filesObj[filename] = []
        }

        filesObj[filename].push(`./scss/pages/${file}`)
    })

    return filesObj
}

function getPagesHtmlFiles() {
    return fs.readdirSync('./src/pug/pages').map(item => {
        const itemName = item.replace('.pug', '')

        return new HtmlWebpackPlugin({
            template: './pug/pages/' + item,
            filename: `${itemName}.html`,
            templateParameters: {
                rawFilename: itemName,
                jsFilename: addJs(itemName),
                cssFilename: addCss(itemName),
            },
            inject: false,
        })
    })
}

function addJs(filename) {
    return fs.readdirSync('./src/js/pages').includes(`${filename}.js`) ? filename : 'app'
}

function addCss(filename) {
    const dir = fs.readdirSync('./src/scss/pages')
    return dir.includes(`${filename}.scss`) || dir.includes(`${filename}.sass`) ? filename : 'app'
}

function addDevServer(argv) {
    return argv.mode === 'development' ? [new webpack.HotModuleReplacementPlugin()] : []
}
