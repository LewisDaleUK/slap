import { FunctionComponent } from 'https://esm.sh/v96/preact@10.11.2/src/index.d.ts';
import { Actor } from '../models/index.ts';
import Layout from './layouts/layout.tsx';

const Profile: FunctionComponent<{ actor: Actor}> = ({ children, actor}) => (
	<Layout>
		<h1>{ actor.handle }</h1>
	</Layout>
);