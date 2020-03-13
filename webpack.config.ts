import { resolve, join } from 'path';
import { Configuration } from 'webpack';
import { yamlParse } from 'yaml-cfn';
import {readFileSync} from 'fs';

const template: any = yamlParse(readFileSync(resolve(__dirname, 'template.yml')).toString());

const config: Configuration = {
  entry: 'src/index.ts',
  // AWS includes the `aws-sdk` in the lambda environment
  // so we don't need to bundle that code. It makes the resulting bundle
  // about 90% smaller
  externals: [{ 'aws-sdk': 'aws-sdk'}],
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: resolve(__dirname, 'dist'),
  },
  module: {
    rules: [{ test: /\.ts$/, loader: 'ts-loader' }],
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  target: 'node',
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
}

export default config;
