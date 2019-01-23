const path = require('path')

const JAVADEPS = /{% javadeps %}(?!{% endjavadeps%})([\s\S]*?){% endjavadeps %}/g

const SNIPPET_INCLUDE = /```(\w*)\s*\[\w*]\((.*)\)\s*```/g
const SNIPPET_WITHIN_TAB = /\[snippet]\((.*)\)/

const CODETABS = /{% codetabs (.*) -%}(?!{%- endcodetabs %})([\s\S]*?){%- endcodetabs %}/g
const CODETABS_SPLIT = /{%- language (.*) -%}/
const CODETABS_TYPE = /name="(.*)",\s?type="(.*)"/

function replaceAll(string, replace_what, replace_with) {
	while(true) {
		var newstring = string.replace(replace_what, replace_with)
		if (newstring === string) {
			return string
		}
		string = newstring
	}
}

module.exports = function(input, variables) {
	const scripts = []
	const resources = []
	let transformationCounter = 0
	let output = input.replace()

	variables.forEach(variable => {
		const key = Object.keys(variable)[0]
		const value = variable[key]
		output = replaceAll(output, '{{' + key + '}}', value)
	})

	output = output.replace(CODETABS, function(match, firstMeta, rest) {
		const entries = []
		const splitted = rest.split('\n').filter(s => s != '')
		splitted.unshift(`{%- language ${firstMeta} -%}`)
		for (let i = 0; i < splitted.length; i++) {
			const content = splitted[i]
			const meta = splitted[i-1]
			if (i % 2 == 0) {
				continue // use meta instead
			} else {
				entries.push({
					meta: meta.match(CODETABS_SPLIT)[1],
					content: content
				})
			}
		}
		const tabs = entries.map(entry => {
			const [_, name, lang] = entry.meta.match(CODETABS_TYPE)
			const content = entry.content.replace(SNIPPET_WITHIN_TAB, function(match, filepath) {
				const basename = path.basename(filepath)
				scripts.push(`//cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/components/prism-${lang}.min.js`)
				const outPath = filepath.replace(/\.\.\//g, '')
				const [outFilePath, fragment] = outPath.split('#')
				resources.push({
					in: filepath.split('#')[0],
					out: outFilePath
				})
				return `[${basename}](${outFilePath} ':include${fragment ? ' :fragment='+fragment : ''} :type=${lang}')`
			})
			return `#### ** ${name} **\n\n${content}`
		}).join('\n\n')
		transformationCounter++
		return `<!-- tabs:start -->\n\n${tabs}\n\n<!-- tabs:end -->`
	})

	output = output.replace(SNIPPET_INCLUDE, function(match, lang, filepath) {
		const basename = path.basename(filepath)
		scripts.push(`//cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/components/prism-${lang}.min.js`)
		const outPath = filepath.replace(/\.\.\//g, '')
		const [outFilePath, fragment] = outPath.split('#')
		resources.push({
			in: filepath.split('#')[0],
			out: outFilePath
		})
		transformationCounter++
		return `[${basename}](${outFilePath} ':include${fragment ? ' :fragment='+fragment : ''} :type=${lang}')`
	})



	output = output.replace(JAVADEPS, function(match, p1) {
		const [groupId, artifactId, version, scope] = p1.split('%').filter(x => x != '').map(i => i.replace(/[,"]/g, '').trim())
		scripts.push('//cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/components/prism-java.min.js')
		scripts.push('//cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/components/prism-scala.min.js')
		scripts.push('//cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/components/prism-groovy.min.js')
		transformationCounter++
		return `<!-- tabs:start -->
#### ** SBT **
\`\`\`scala
libraryDependencies ++= Seq(
  "${groupId}" %% "${artifactId}" % ${version}${scope ? ' % "' + scope + '"' : ''}
)
\`\`\`
#### ** Maven **
\`\`\`xml
<dependencies>
    <dependency>
        <groupId>${groupId}</groupId>
        <artifactId>${artifactId}</artifactId>
        <version>${version}</version>${scope ? `\n        <scope>${scope}</scope>` : ''}
    </dependency>
</dependencies>
\`\`\`
#### ** Gradle **
\`\`\`groovy
dependencies {
    ${scope ? scope : 'compile'} group: '${groupId}', name: '${artifactId}', version:'${version}'
}\`\`\`
<!-- tabs:end -->
`
	})

	return {
		content: output,
		resources: resources,
		scripts: scripts,
		counter: transformationCounter
	}
}
