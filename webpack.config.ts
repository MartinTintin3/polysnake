import * as path from "path";
import * as webpack from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";

const config: webpack.Configuration = {
	plugins: [
		new CopyWebpackPlugin({
			patterns: [{ from: "./static", to: "" }],
		}),
	],
	entry: "./client/src/index.ts",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [{
					loader: "ts-loader",
					options: {
						configFile: path.resolve(__dirname, "client/tsconfig.json")
					}
				}],
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist/client"),
	},
};

export default config;