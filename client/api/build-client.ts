import axios from 'axios';
import { NextPageContext } from 'next';

const buildClient = ({ req }: NextPageContext) =>
  req
    ? axios.create({
        baseURL: 'http://ingress-nginx-controller.ingress-nginx',
        headers: req.headers,
      })
    : axios.create({
        baseURL: '/',
      });

export default buildClient;
