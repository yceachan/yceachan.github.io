export default {
    // 扫描白名单规则 (正则表达式)
    // 只有匹配这些规则的路径（及其父目录）才会被扫描和包含。
    // 路径是相对于 Workspace 根目录的相对路径，使用正斜杠 '/'。
    include: [
        // 示例：匹配 Offerthings 目录下的所有内容
        /^Offerthings\/.*$/,
        
        
        // 示例：匹配 OsCookBook 下的所有内容
        /^OsCookBook\/.*$/,

        /^MCUthings\/.*$/,
        
        // 只扫描 MPUthings 下 imx-wsl 的 note 目录
        /^MPUthings\/imx-wsl\/note\/.*$/,

        /^蓝牙协议栈\/.*$/,

     
        // 示例：匹配 WikiExplorer 自身的一些文档 (排除 dist/node_modules 在硬编码逻辑中处理)
        /^WikiExplorer\/.*\.md$/,

        // 匹配根目录下的特定文件
        /^README\.md$/,
    ],
    
    // 总是忽略的黑名单 (即使匹配 include 也会被忽略)
    // 通常用于排除构建产物、版本控制目录等
    exclude: [
        /\.git/,
        /node_modules/,
        /^WikiExplorer\/dist/,
        /^WikiExplorer\/public/,
        /^WikiExplorer\/build/,
        /\.DS_Store/,
        // 排除 imx-wsl 中除 note 以外的所有子目录 (提高性能，规避损坏链接)
        /^MPUthings\/imx-wsl\/(?!note(\/|$)).*$/
    ]
};
