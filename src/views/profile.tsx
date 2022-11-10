import { FunctionComponent } from 'preact';
import render from "preact-render-to-string";
import { Actor } from '../models/index.ts';
import Layout from './layouts/layout.tsx';

const Profile: FunctionComponent<{ actor: Actor }> = ({ actor }) => (
	<Layout>
		<h1>{ actor.handle }</h1>
	</Layout>
);

export default (actor: Actor) => render(<Profile actor={actor} />);