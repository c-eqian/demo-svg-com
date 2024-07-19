module.exports = {
  plugins: [
    //   删除宽高等属性
    'removeDimensions',
    'removeXMLProcInst',
    //   删除相关的文档类型
    'removeDoctype',
    {
      name: 'convertColors', // 将fill设置为currentColor
      params: {
        currentColor: true,
      },
    },
    //   去除svg中带有class的属性
    {
      name: 'removeAttrs',
      params: {
        attrs: "(class)"
      },
    },
  ],
}
