
// 以下是分批执行例子，并不是并发执行。
// 分批切片处理的话，当前片如果存在较长的时间处理时，那么就不会进行下一步的处理。
(async function () {

    const asyncFn = (v, d) => {
        return new Promise(resolve => {
            console.log('message: ' + v);
            setTimeout(() => {
                resolve(v);
            }, d * 1e3);
        })
    };

    const asyncArr = [
        () => asyncFn('aaa', 2),
        () => asyncFn('aaa', 3),
        () => asyncFn('aaa', 1),
        () => asyncFn('bbb', 2),
        () => asyncFn('bbb', 3),
        () => asyncFn('ccc', 1),
        () => asyncFn('ccc', 2),
    ];

    const limit = 2;
    let len = 0;
    const start = Date.now();
    while (len < asyncArr.length) {
        const runArr = asyncArr.slice(len, len + limit);
        const res = await Promise.all(
            runArr.map(async (fn) => {
                try {
                    return await fn();
                } catch { }
            })
        );
        console.log('res: ', res);
        len += limit;
    }
    console.log('finish: ', Date.now() - start, 'ms');

})();