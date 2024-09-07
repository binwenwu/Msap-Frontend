module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        'type-enum': [
            2,
            'always', [
                'feat', // 新功能（feature）  
                'fix', // 修补bug  
                'docs', // 文档（documentation）  
                'style', // 格式（不影响代码运行的变动）  
                'asset', // 文件资源相关
                'update', // 普通代码改动(删除增加注释、删除无用代码、代码结构调整等)
                'refactor', // 重构（即不是新增功能，也不是修改bug的代码变动）  
                'test', // 增加测试  
                'chore', // 构建过程或辅助工具的变动  
                'config', // 配置文件变动
            ],
        ],
    }
};