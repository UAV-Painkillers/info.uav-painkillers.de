import type { IntrinsicElements } from "@builder.io/qwik";
import { component$, useComputed$ } from "@builder.io/qwik";
import type { CMSRegisteredComponent } from "../cms-registered-component";
import type { SbBlokData } from "@storyblok/js";
import { storyblokEditable } from "@storyblok/js";
import { StoryBlokComponentArray } from "../storyblok/component-array";

interface Props {
  reference: SbBlokData[];
}
export const CMSSnippet = component$(
  (props: Props & IntrinsicElements["div"]) => {
    const { reference, ...divProps } = props;

    const bloks = useComputed$(() =>
      reference
        .map((r) => r.content as { items: SbBlokData[] })
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        .filter((b) => !!b),
    );

    return (
      <div {...divProps}>
        {bloks.value.map((blok, index) => (
          <StoryBlokComponentArray key={index} bloks={blok.items} />
        ))}
      </div>
    );
  },
);

export const CMSSnippetRegistryDefinition: CMSRegisteredComponent = {
  name: "CMSSnippet",
  component: component$((story: any) => {
    return <CMSSnippet {...storyblokEditable(story)} {...story} />;
  }),
};
