import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["antd", "@ant-design/x", "@ant-design/icons"],
};

export default nextConfig;
