import chalk from 'chalk';

const pad = (val: number) => (val > 10 ? val : '0' + val);

const logDate = (process.env.log_date ?? 'true') === 'true';
const logTime = (process.env.log_time ?? 'true') === 'true';
const logPID = (process.env.log_pid ?? 'true') === 'true';

/** Creates a prefix for verbose logging. */
export const logPrefix = () => {
    const pipe = chalk.gray(' │ ');
    const pid = logPID ? process.pid + pipe : '';

    const now = new Date();
    const amPm = now.getHours() < 12 ? 'AM' : 'PM';
    let date =
        [now.getMonth() + 1, now.getDate()].map((seg) => pad(seg)).join('/') +
        `/${now.getFullYear()}` +
        `${!logTime ? pipe : ', '}`;
    let time =
        [now.getHours() % 12, now.getMinutes(), now.getSeconds()]
            .map((seg) => pad(seg))
            .join(':') + ` ${amPm}${pipe}`;

    if (!logDate) date = '';
    if (!logTime) time = '';

    const str = chalk.green(pid) + date + time;
    const len = (pid + date + time).length;

    return {
        toString: () => str,
        indent: ' '.repeat(len)
    };
};
