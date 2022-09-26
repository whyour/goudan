import PuzzleGame from './PuzzleGame';
import getPuzzle, { Puzzle } from './tianapi';
import Interceptor from '../../Interceptor';

const gameSpace: Record<string, PuzzleGame<Puzzle>> = {};

interface WordPuzzleConfig {
  limit: number;
}

const defaultWordPuzzleConfig = (): WordPuzzleConfig => {
  return {
    limit: 5,
  };
};

const wordPuzzleInterceptor = new Interceptor('word-puzzle', (context) => {
  context.template.add('word-puzzle.game.start', [
    '来啦，猜字谜：\n{puzzle}',
    '要猜字谜吗？那么来试试吧：\n{puzzle}',
  ]);
  context.template.add(
    'word-puzzle.game.playing',
    '当前正在进行一个猜字谜游戏，赶紧回答吧。',
  );
  context.template.add('word-puzzle.game.win', [
    '{name}答对啦！\n谜底是：{answer}\n{reason}',
  ]);
  context.template.add('word-puzzle.game.lose', [
    '没有人回答出来吗？那么狗蛋公布答案了。\n谜底是：{answer}\n{reason}',
  ]);
})
  .title('猜字谜')
  .alias('字谜')
  .usage('来和狗蛋猜字谜吧！')
  .check((context, message) => {
    const contact = message.talker();
    const room = message.room();
    const spaceId = room ? `room_${room.id}` : `contact_${contact.id}`;
    const args = { contact, room, spaceId };
    if (/^狗蛋/.test(message.text()) && /猜字谜/.test(message.text())) {
      return {
        ...args,
        action: 'start',
      };
    } else if (gameSpace[spaceId] && gameSpace[spaceId].status === 'start') {
      return {
        ...args,
        action: 'answer',
        content: message.text(),
      };
    }
  })
  .handler(async (context, message, checkerArgs) => {
    const { spaceId, action, content } = checkerArgs;
    if (action === 'start') {
      const config = {
        ...defaultWordPuzzleConfig(),
        ...context.getMethodConfig<WordPuzzleConfig>('word_puzzle'),
      };
      if (!gameSpace[spaceId] || gameSpace[spaceId].status === 'idle') {
        gameSpace[spaceId] = new PuzzleGame<Puzzle>();
        gameSpace[spaceId].on('start', async () => {
          try {
            const puzzle = await getPuzzle();
            gameSpace[spaceId].data = puzzle;
            await message.say(
              context.template.use('word-puzzle.game.start', {
                puzzle: puzzle.content,
              }),
            );
          } catch (e) {
            throw e;
          }
        });
        gameSpace[spaceId].on('answer', async (answer) => {
          if (answer.content === gameSpace[spaceId].data.answer) {
            await gameSpace[spaceId].end(answer.userName);
            return true;
          }
        });
        gameSpace[spaceId].on('end', async (userName: string) => {
          if (userName)
            await message.say(
              context.template.use('word-puzzle.game.win', {
                name: userName,
                answer: gameSpace[spaceId].data.answer,
                reason: gameSpace[spaceId].data.reason,
              }),
            );
          else
            await message.say(
              context.template.use('word-puzzle.game.lose', {
                answer: gameSpace[spaceId].data.answer,
                reason: gameSpace[spaceId].data.reason,
              }),
            );
        });
        await gameSpace[spaceId].start();
      } else {
        return context.template.use('word-puzzle.game.playing');
      }
    } else if (action === 'answer') {
      const result = await gameSpace[spaceId].answer({
        content,
        userId: message.talker().id,
        userName: message.talker().name(),
      });
      if (result) return '';
    }
  });
export default wordPuzzleInterceptor;
