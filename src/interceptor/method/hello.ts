import Interceptor from '../Interceptor';

const HelloInterceptor = new Interceptor('Hello', (context) => {
  context.template.add('helloWorld', '狗蛋来了！');
})
  .check((context, message) => {
    return /^狗蛋$/.test(message.text());
  })
  .handler((context) => {
    return context.template.use('helloWorld');
  })
  .attribute('date', () => new Date(), '当前时间');
export default HelloInterceptor;
