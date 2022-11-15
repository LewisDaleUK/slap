/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
import { FunctionComponent } from 'preact';
import render from "preact-render-to-string";
import * as Actor from '../actor/mod.ts';
import Layout from './layouts/layout.tsx';

const Profile: FunctionComponent<{ actor: Actor.Model }> = ({ actor }) => (
	<Layout>
		<h1>{ actor.handle }</h1>
	</Layout>
);

export default (actor: Actor.Model) => render(<Profile actor={actor} />);