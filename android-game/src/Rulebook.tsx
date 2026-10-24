import { Fragment } from 'react';
import { RULES } from '../shared/rules';
export function Rulebook() {
  return (
    <>
      {RULES.map(([title, body]) => (
        <Fragment key={title}>
          <h3>{title}</h3>
          <p>{body}</p>
        </Fragment>
      ))}
    </>
  );
}
