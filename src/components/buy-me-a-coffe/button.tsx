import type { QRL, QwikIntrinsicElements } from "@builder.io/qwik";
import { component$, $ } from "@builder.io/qwik";
import EmojiSvg from "./emoji.svg?jsx";
import styles from "./button.module.css";
import classNames from "classnames";
import type { JSX } from "@builder.io/qwik/jsx-runtime";
import type { CMSRegisteredComponent } from "~/components/cms-registered-component";
import { storyblokEditable } from "@storyblok/js";

interface Props {
  slug: string;
  text: string;
  icon?: QRL<(className: string) => JSX.Element>;
}

export const BuyMeACoffeButtonContentRenderer = $(
  (props: Props & QwikIntrinsicElements["div"]) => {
    const { slug, text, icon, ...divProps } = props;

    return (
      <div
        {...divProps}
        class={classNames("button", styles.wrapper, divProps.class)}
      >
        <a
          class={styles.bmcButton}
          target="_blank"
          href={`https://buymeacoffee.com/${slug}`}
        >
          {icon ? (
            icon(styles.bmcButtonIcon)
          ) : (
            <EmojiSvg class={styles.bmcButtonIcon} />
          )}
          <span class={styles.bmcButtonText}>{text}</span>
        </a>
      </div>
    );
  },
);

export const BuyMeACoffeButton = component$(
  (props: Props & QwikIntrinsicElements["div"]) => {
    return <>{BuyMeACoffeButtonContentRenderer(props)}</>;
  },
);

export const BuyMeACoffeeButtonRegistryDefinition: CMSRegisteredComponent = {
  component: component$((storyData: any) => {
    return (
      <BuyMeACoffeButton {...storyData} {...storyblokEditable(storyData)} />
    );
  }),
  name: "BuyMeACoffeButton",
};
